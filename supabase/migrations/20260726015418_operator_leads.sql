CREATE TABLE public.operator_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  property_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit the sign-up form
CREATE POLICY "Anyone can insert operator leads"
ON public.operator_leads
FOR INSERT
TO public
WITH CHECK (true);

-- Only service role can read leads (staff view them via backend/admin, not the public site)
CREATE POLICY "Service role can read operator leads"
ON public.operator_leads
FOR SELECT
USING (auth.role() = 'service_role'::text);

-- Only service role can update lead status
CREATE POLICY "Service role can update operator leads"
ON public.operator_leads
FOR UPDATE
USING (auth.role() = 'service_role'::text);
