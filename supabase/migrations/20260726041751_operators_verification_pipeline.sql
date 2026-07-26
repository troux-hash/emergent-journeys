-- Verification & enrichment pipeline: the foundation for turning a raw
-- operator_leads submission into a trustworthy, published listing.
--
-- is_verified is a generated column (not a flag anyone can just set) — it's
-- true only when all four checklist items are true, and publishing is only
-- possible once is_verified is true. Both are enforced at the database
-- level so the "Fichua Verified" badge can never drift from the actual
-- checklist state.

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

  -- The four-point verification checklist (see architecture memo, section 2)
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
  -- Can't publish without passing all four checklist items.
  CONSTRAINT operators_publish_requires_verification CHECK (
    status = 'draft'
    OR (status = 'published' AND identity_verified AND photo_gps_verified AND whatsapp_verified AND payout_verified)
  )
);

CREATE INDEX idx_operators_status ON public.operators (status);
CREATE INDEX idx_operators_lead_id ON public.operators (lead_id);

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

-- Room types

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

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage room types" ON public.room_types
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view room types of published operators" ON public.room_types
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.operators o
      WHERE o.id = room_types.operator_id AND o.status = 'published'
    )
  );

CREATE TRIGGER update_room_types_updated_at
  BEFORE UPDATE ON public.room_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
