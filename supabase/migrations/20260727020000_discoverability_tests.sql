-- Evidence log for AI-discoverability before/after testing.
--
-- Purpose: prove (or disprove) that listing on Fichua improves an
-- operator's visibility in AI answer engines. This only works if the
-- BASELINE is captured before a listing is indexed -- once it's indexed
-- the "before" is gone forever. Storing this as structured rows rather
-- than screenshots in a folder means we can actually compare phases,
-- count appearance rates, and show an operator their own before/after.
--
-- Admin-only: this is internal evidence, not public content.

CREATE TABLE public.discoverability_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  operator_id UUID REFERENCES public.operators(id) ON DELETE CASCADE,

  -- 'baseline' = captured BEFORE the listing was published/indexed.
  -- 'followup' = same query re-run after indexing, for comparison.
  phase TEXT NOT NULL CHECK (phase IN ('baseline', 'followup')),

  -- Which answer engine was queried, and exactly what was asked.
  -- Query text must be reused verbatim in the followup for the
  -- comparison to mean anything.
  engine TEXT NOT NULL CHECK (engine IN ('chatgpt', 'perplexity', 'google_ai', 'gemini', 'claude', 'other')),
  query_text TEXT NOT NULL,

  -- Outcome of that query.
  operator_mentioned BOOLEAN NOT NULL DEFAULT false,
  fichua_cited BOOLEAN NOT NULL DEFAULT false,
  price_quoted_correctly BOOLEAN,
  position INTEGER,               -- rank among recommendations, if listed
  competitors_mentioned TEXT[],   -- who showed up instead / alongside
  response_excerpt TEXT,          -- short quote of what the engine actually said
  screenshot_url TEXT,            -- optional link to a stored screenshot
  notes TEXT,

  tested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_disc_tests_operator ON public.discoverability_tests (operator_id, phase);
CREATE INDEX idx_disc_tests_tested_at ON public.discoverability_tests (tested_at DESC);

ALTER TABLE public.discoverability_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage discoverability tests"
  ON public.discoverability_tests
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Explicit grants: per this project's history, default privileges don't
-- reliably cover newly created tables. No anon grant at all -- this data
-- is never public.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discoverability_tests TO authenticated;
