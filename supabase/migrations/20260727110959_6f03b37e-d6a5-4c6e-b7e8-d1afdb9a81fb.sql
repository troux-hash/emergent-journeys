
CREATE TABLE public.discoverability_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES public.operators(id) ON DELETE SET NULL,
  phase TEXT NOT NULL CHECK (phase IN ('baseline','followup')),
  engine TEXT NOT NULL,
  query_text TEXT NOT NULL,
  operator_mentioned BOOLEAN NOT NULL DEFAULT false,
  fichua_cited BOOLEAN NOT NULL DEFAULT false,
  price_quoted_correctly BOOLEAN,
  position INTEGER,
  competitors_mentioned TEXT[],
  response_excerpt TEXT,
  notes TEXT,
  tested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discoverability_tests TO authenticated;
GRANT ALL ON public.discoverability_tests TO service_role;

ALTER TABLE public.discoverability_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage discoverability tests"
  ON public.discoverability_tests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_discoverability_tests_updated_at
  BEFORE UPDATE ON public.discoverability_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_discoverability_tests_operator ON public.discoverability_tests(operator_id);
CREATE INDEX idx_discoverability_tests_phase ON public.discoverability_tests(phase);
