-- Booking + availability engine.
--
-- The concurrency-safety comes from a Postgres EXCLUDE constraint, not
-- application-level "check then insert" logic (which always has a race
-- window). Two simultaneous booking attempts for overlapping dates on the
-- same room are handled by Postgres itself — one insert succeeds, the
-- other fails with an exclusion violation (SQLSTATE 23P01), guaranteed,
-- no matter how close together they arrive.

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

  -- 'pending' = request received, no payment collected yet (payments aren't
  -- wired up); 'confirmed' / 'cancelled' are here for when they are.
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

-- The actual concurrency safety net: no two non-cancelled bookings for the
-- same room can have overlapping stay ranges.
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (room_type_id WITH =, stay_range WITH &&)
  WHERE (status <> 'cancelled');

CREATE INDEX idx_bookings_operator_id ON public.bookings (operator_id);
CREATE INDEX idx_bookings_room_type_id ON public.bookings (room_type_id);
CREATE INDEX idx_bookings_review_token ON public.bookings (review_token);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public (the booking form) can create a booking request, but never read
-- back other guests' bookings — matches the same "insert-only, no broad
-- read" pattern already used for operator_leads and chat_messages.
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

-- Public, read-only availability check: lets the booking form (or future
-- UI) ask "is this room free for these dates" without needing any broader
-- access to the bookings table. SECURITY DEFINER so it can see all
-- bookings internally while only ever returning a boolean.
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_type_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.room_type_id = p_room_type_id
      AND b.status <> 'cancelled'
      AND b.stay_range && daterange(p_check_in, p_check_out, '[)')
  );
$$;

REVOKE ALL ON FUNCTION public.check_room_availability(UUID, DATE, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_room_availability(UUID, DATE, DATE) TO anon, authenticated;
