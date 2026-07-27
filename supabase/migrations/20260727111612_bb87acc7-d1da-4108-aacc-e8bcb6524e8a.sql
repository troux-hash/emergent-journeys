ALTER TABLE public.discoverability_tests ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discoverability_tests TO authenticated;
GRANT ALL ON public.discoverability_tests TO service_role;