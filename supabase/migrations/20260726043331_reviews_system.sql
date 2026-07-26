-- Reviews system: two sources blended, kept clearly distinguishable.
--
-- 'fichua_verified' reviews are the trust moat — they can ONLY ever be
-- created tied to a real booking_id (enforced by a CHECK constraint, not
-- just app logic), and only via the submit_verified_review() RPC below,
-- which checks a per-booking token before allowing the insert. There is
-- no public INSERT policy on this table at all — every write is either an
-- admin (importing/curating a review) or that one validated RPC path.

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

  CONSTRAINT reviews_source_check CHECK (
    source IN ('fichua_verified', 'google', 'tripadvisor', 'booking_com', 'facebook', 'other')
  ),
  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_moderation_check CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  -- The whole point of the "Verified Stay" tag: it's structurally
  -- impossible to create one without a real booking behind it.
  CONSTRAINT reviews_verified_requires_booking CHECK (
    source <> 'fichua_verified' OR booking_id IS NOT NULL
  )
);

CREATE INDEX idx_reviews_operator_id ON public.reviews (operator_id);
CREATE INDEX idx_reviews_moderation_status ON public.reviews (moderation_status);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can only ever see approved reviews on published listings — never
-- pending/rejected ones, and never reviews for an unpublished operator.
CREATE POLICY "Public can view approved reviews on published operators" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (
    moderation_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.operators o
      WHERE o.id = reviews.operator_id AND o.status = 'published'
    )
  );

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- The one and only public write path for a verified review: validates the
-- booking's own review_token (emailed to the guest, effectively
-- unguessable) before allowing the insert, and requires the stay to have
-- actually ended. New verified reviews land as 'pending' — moderation
-- still applies before they go public, same as everything else.
CREATE OR REPLACE FUNCTION public.submit_verified_review(
  p_booking_id UUID,
  p_token UUID,
  p_rating INTEGER,
  p_review_text TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking RECORD;
  v_review_id UUID;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.review_token <> p_token THEN
    RAISE EXCEPTION 'Invalid review link';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'This booking was cancelled';
  END IF;

  IF v_booking.check_out > CURRENT_DATE THEN
    RAISE EXCEPTION 'This stay has not finished yet';
  END IF;

  IF EXISTS (SELECT 1 FROM public.reviews WHERE booking_id = p_booking_id) THEN
    RAISE EXCEPTION 'A review has already been submitted for this stay';
  END IF;

  INSERT INTO public.reviews (
    operator_id, booking_id, source, reviewer_name, rating, review_text, moderation_status
  ) VALUES (
    v_booking.operator_id, p_booking_id, 'fichua_verified', v_booking.guest_name,
    p_rating, NULLIF(btrim(coalesce(p_review_text, '')), ''), 'pending'
  )
  RETURNING id INTO v_review_id;

  RETURN v_review_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_verified_review(UUID, UUID, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_verified_review(UUID, UUID, INTEGER, TEXT) TO anon, authenticated;

-- Lets the review-submission page show the booking's property/dates
-- without exposing the guest's own contact details or any other booking's
-- data — same "narrow, validated, read-only" shape as
-- get_chat_session_messages / check_room_availability.
CREATE OR REPLACE FUNCTION public.get_booking_for_review(
  p_booking_id UUID,
  p_token UUID
)
RETURNS TABLE (
  operator_name TEXT,
  check_in DATE,
  check_out DATE,
  already_reviewed BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    o.name,
    b.check_in,
    b.check_out,
    EXISTS (SELECT 1 FROM public.reviews r WHERE r.booking_id = b.id)
  FROM public.bookings b
  JOIN public.operators o ON o.id = b.operator_id
  WHERE b.id = p_booking_id AND b.review_token = p_token;
$$;

REVOKE ALL ON FUNCTION public.get_booking_for_review(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_for_review(UUID, UUID) TO anon, authenticated;
