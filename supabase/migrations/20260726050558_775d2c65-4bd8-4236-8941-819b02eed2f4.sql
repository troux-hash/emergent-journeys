-- Verification & enrichment pipeline: the foundation for turning a raw
-- operator_leads submission into a trustworthy, published listing.

CREATE TABLE public.operators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.operator_leads(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  lat NUMERIC,
  lng NUMERIC,
  phone TEXT,
  email TEXT,
  website TEXT,
  price_range TEXT,
  star_rating NUMERIC,
  years_operating INTEGER,
  hero_image TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  check_in TEXT,
  check_out TEXT,
  currencies_accepted TEXT[] NOT NULL DEFAULT '{}',
  payment_accepted TEXT[] NOT NULL DEFAULT '{}',
  solar_powered BOOLEAN NOT NULL DEFAULT false,
  local_hire_percent INTEGER,
  community_percent INTEGER,
  water_conservation BOOLEAN NOT NULL DEFAULT false,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  instagram_url TEXT,
  tripadvisor_url TEXT,
  identity_verified BOOLEAN NOT NULL DEFAULT false,
  photo_gps_verified BOOLEAN NOT NULL DEFAULT false,
  whatsapp_verified BOOLEAN NOT NULL DEFAULT false,
  payout_verified BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN GENERATED ALWAYS AS (
    identity_verified AND photo_gps_verified AND whatsapp_verified AND payout_verified
  ) STORED,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT operators_status_check CHECK (status IN ('draft', 'published')),
  CONSTRAINT operators_publish_requires_verification CHECK (
    status = 'draft'
    OR (status = 'published' AND identity_verified AND photo_gps_verified AND whatsapp_verified AND payout_verified)
  )
);

CREATE INDEX idx_operators_status ON public.operators (status);
CREATE INDEX idx_operators_lead_id ON public.operators (lead_id);

GRANT SELECT ON public.operators TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.operators TO authenticated;
GRANT ALL ON public.operators TO service_role;

ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage operators" ON public.operators
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view published operators" ON public.operators
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE TRIGGER update_operators_updated_at
  BEFORE UPDATE ON public.operators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.room_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_per_night NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  max_guests INTEGER NOT NULL DEFAULT 2,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_room_types_operator_id ON public.room_types (operator_id);

GRANT SELECT ON public.room_types TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.room_types TO authenticated;
GRANT ALL ON public.room_types TO service_role;

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage room types" ON public.room_types
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view room types of published operators" ON public.room_types
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.operators o WHERE o.id = room_types.operator_id AND o.status = 'published')
  );

CREATE TRIGGER update_room_types_updated_at
  BEFORE UPDATE ON public.room_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookings engine

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE RESTRICT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_whatsapp TEXT NOT NULL,
  guests INTEGER NOT NULL,
  special_requests TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  stay_range DATERANGE GENERATED ALWAYS AS (daterange(check_in, check_out, '[)')) STORED,
  price_per_night_snapshot NUMERIC NOT NULL,
  currency_snapshot TEXT NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  review_token UUID NOT NULL DEFAULT gen_random_uuid(),
  review_requested_at TIMESTAMPTZ,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  CONSTRAINT bookings_dates_check CHECK (check_out > check_in),
  CONSTRAINT bookings_guests_check CHECK (guests >= 1 AND guests <= 20),
  CONSTRAINT bookings_email_check CHECK (guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (room_type_id WITH =, stay_range WITH &&)
  WHERE (status <> 'cancelled');

CREATE INDEX idx_bookings_operator_id ON public.bookings (operator_id);
CREATE INDEX idx_bookings_room_type_id ON public.bookings (room_type_id);
CREATE INDEX idx_bookings_review_token ON public.bookings (review_token);

GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can request a booking" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(guest_name)) BETWEEN 1 AND 100
    AND length(btrim(guest_whatsapp)) BETWEEN 1 AND 40
    AND status = 'pending'
  );

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_type_id UUID, p_check_in DATE, p_check_out DATE
) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.room_type_id = p_room_type_id
      AND b.status <> 'cancelled'
      AND b.stay_range && daterange(p_check_in, p_check_out, '[)')
  );
$$;
REVOKE ALL ON FUNCTION public.check_room_availability(UUID, DATE, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_room_availability(UUID, DATE, DATE) TO anon, authenticated;

-- Reviews

CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  external_url TEXT,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  review_text TEXT,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  language TEXT NOT NULL DEFAULT 'en',
  moderation_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reviews_source_check CHECK (source IN ('fichua_verified', 'google', 'tripadvisor', 'booking_com', 'facebook', 'other')),
  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_moderation_check CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT reviews_verified_requires_booking CHECK (source <> 'fichua_verified' OR booking_id IS NOT NULL)
);

CREATE INDEX idx_reviews_operator_id ON public.reviews (operator_id);
CREATE INDEX idx_reviews_moderation_status ON public.reviews (moderation_status);

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view approved reviews on published operators" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (
    moderation_status = 'approved'
    AND EXISTS (SELECT 1 FROM public.operators o WHERE o.id = reviews.operator_id AND o.status = 'published')
  );

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.submit_verified_review(
  p_booking_id UUID, p_token UUID, p_rating INTEGER, p_review_text TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_booking RECORD; v_review_id UUID;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN RAISE EXCEPTION 'Rating must be between 1 and 5'; END IF;
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF v_booking.review_token <> p_token THEN RAISE EXCEPTION 'Invalid review link'; END IF;
  IF v_booking.status = 'cancelled' THEN RAISE EXCEPTION 'This booking was cancelled'; END IF;
  IF v_booking.check_out > CURRENT_DATE THEN RAISE EXCEPTION 'This stay has not finished yet'; END IF;
  IF EXISTS (SELECT 1 FROM public.reviews WHERE booking_id = p_booking_id) THEN
    RAISE EXCEPTION 'A review has already been submitted for this stay';
  END IF;
  INSERT INTO public.reviews (operator_id, booking_id, source, reviewer_name, rating, review_text, moderation_status)
  VALUES (v_booking.operator_id, p_booking_id, 'fichua_verified', v_booking.guest_name,
    p_rating, NULLIF(btrim(coalesce(p_review_text, '')), ''), 'pending')
  RETURNING id INTO v_review_id;
  RETURN v_review_id;
END; $$;
REVOKE ALL ON FUNCTION public.submit_verified_review(UUID, UUID, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_verified_review(UUID, UUID, INTEGER, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_booking_for_review(p_booking_id UUID, p_token UUID)
RETURNS TABLE (operator_name TEXT, check_in DATE, check_out DATE, already_reviewed BOOLEAN)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT o.name, b.check_in, b.check_out,
    EXISTS (SELECT 1 FROM public.reviews r WHERE r.booking_id = b.id)
  FROM public.bookings b JOIN public.operators o ON o.id = b.operator_id
  WHERE b.id = p_booking_id AND b.review_token = p_token;
$$;
REVOKE ALL ON FUNCTION public.get_booking_for_review(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_for_review(UUID, UUID) TO anon, authenticated;

-- Chat operator context
ALTER TABLE public.chat_messages
  ADD COLUMN operator_id UUID REFERENCES public.operators(id) ON DELETE SET NULL;
CREATE INDEX idx_chat_messages_operator_id ON public.chat_messages (operator_id);