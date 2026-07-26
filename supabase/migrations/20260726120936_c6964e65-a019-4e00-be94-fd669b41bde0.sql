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

GRANT INSERT ON public.support_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_requests TO authenticated;
GRANT ALL ON public.support_requests TO service_role;

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