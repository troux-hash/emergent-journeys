-- Dispute/support-request path that routes to Fichua directly, not just the
-- operator. Anyone (traveler or operator) who hits a problem with a booking
-- can file a report here instead of it disappearing into a WhatsApp thread
-- with no oversight. Admin-visible at /intranet/support; anon can only ever
-- create a report, never read one back (matches the pattern already used
-- for bookings: public insert, no public select).

CREATE TABLE public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  operator_id UUID REFERENCES public.operators(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reporter_contact TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_support_requests_status ON public.support_requests (status, created_at DESC);

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can file a support request"
  ON public.support_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage support requests"
  ON public.support_requests
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Explicit table-level GRANTs: per the earlier operators/room_types/bookings/
-- reviews migration, this project's default privileges don't reliably cover
-- newly created tables, so these are spelled out rather than assumed.
GRANT INSERT ON public.support_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_requests TO authenticated;
