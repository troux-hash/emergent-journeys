ALTER TABLE public.operator_leads
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
  ADD COLUMN IF NOT EXISTS facebook_handle TEXT,
  ADD COLUMN IF NOT EXISTS num_rooms INTEGER,
  ADD COLUMN IF NOT EXISTS price_min NUMERIC,
  ADD COLUMN IF NOT EXISTS price_max NUMERIC;

DROP POLICY IF EXISTS "Anyone can submit an operator lead" ON public.operator_leads;
CREATE POLICY "Anyone can submit an operator lead"
  ON public.operator_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (name IS NULL OR length(btrim(name)) <= 100)
    AND length(btrim(property_name)) BETWEEN 1 AND 150
    AND (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
    AND phone IS NOT NULL AND length(btrim(phone)) BETWEEN 1 AND 40
    AND (instagram_handle IS NULL OR length(instagram_handle) <= 100)
    AND (tiktok_handle IS NULL OR length(tiktok_handle) <= 100)
    AND (facebook_handle IS NULL OR length(facebook_handle) <= 100)
    AND (num_rooms IS NULL OR num_rooms BETWEEN 0 AND 10000)
    AND (price_min IS NULL OR price_min >= 0)
    AND (price_max IS NULL OR price_max >= 0)
    AND status = 'new'
  );