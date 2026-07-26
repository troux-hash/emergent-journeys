CREATE TABLE public.operator_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  property_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.operator_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.operator_leads TO authenticated;
GRANT ALL ON public.operator_leads TO service_role;

ALTER TABLE public.operator_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an operator lead"
  ON public.operator_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view operator leads"
  ON public.operator_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update operator leads"
  ON public.operator_leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete operator leads"
  ON public.operator_leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_operator_leads_updated_at
  BEFORE UPDATE ON public.operator_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();