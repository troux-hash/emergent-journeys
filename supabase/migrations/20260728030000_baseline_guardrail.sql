-- Baseline-capture automation + a publish guardrail.
--
-- WHY
-- Two problems this addresses, both surfaced today:
--
-- 1. The AI-discoverability baseline is unrecoverable. Once a listing is
--    indexed, you can never go back and measure what the answer engines
--    said BEFORE it existed -- and that before/after is the whole
--    evidence base for the pitch to operators. Relying on remembering
--    to do it manually means it will eventually be missed.
--
-- 2. A seeded demo operator ("Yokan Lodge") was published, prerendered
--    and made crawlable while carrying a Fichua Verified badge, despite
--    describing a real third-party business with the wrong location and
--    invented rooms. Publishing is the point of no return -- it is where
--    a mistake stops being internal and starts being indexed.
--
-- WHAT THIS DOES
-- * Auto-generates the standard baseline query set for an operator, so
--   capturing it is paste-the-answer rather than invent-the-questions.
-- * Reports whether an operator is ready to publish, including whether
--   baselines exist. Advisory, surfaced in the UI -- deliberately NOT a
--   hard database constraint, because a hard block on a judgement call
--   tends to get worked around rather than respected.

-- ---------------------------------------------------------------
-- Generate the standard baseline queries for one operator
-- ---------------------------------------------------------------
-- The same phrasing must be reused at follow-up or the comparison is
-- meaningless, so the wording is generated once and stored rather than
-- retyped from memory each time.
CREATE OR REPLACE FUNCTION public.generate_baseline_queries(p_operator_id UUID)
RETURNS TABLE (engine TEXT, query_text TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  op RECORD;
  v_place TEXT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  SELECT o.name, o.city, o.country INTO op
  FROM public.operators o WHERE o.id = p_operator_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_place := COALESCE(NULLIF(op.city, ''), NULLIF(op.country, ''), 'the area');

  RETURN QUERY
  SELECT e.engine, q.query_text
  FROM (VALUES ('chatgpt'), ('perplexity'), ('google_ai')) AS e(engine)
  CROSS JOIN (VALUES
    -- Brand query: does the engine know this property exists at all?
    (format('%s %s', op.name, v_place)),
    -- Discovery query: would it recommend them unprompted?
    (format('best places to stay in %s', v_place)),
    -- Commercial query: can it quote a real price?
    (format('how much does it cost to stay at %s', op.name))
  ) AS q(query_text);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_baseline_queries(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_baseline_queries(UUID) TO authenticated, service_role;

-- ---------------------------------------------------------------
-- Pre-create empty baseline rows, ready to be filled in
-- ---------------------------------------------------------------
-- Inserts one 'baseline' row per engine/query with the outcome fields
-- left at their defaults (not mentioned, not cited). If the operator
-- genuinely doesn't appear -- the expected case before indexing --
-- those defaults are already the correct answer and nothing needs
-- editing.
CREATE OR REPLACE FUNCTION public.seed_baseline_tests(p_operator_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  n INTEGER := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  FOR r IN SELECT * FROM public.generate_baseline_queries(p_operator_id) LOOP
    -- Don't duplicate a baseline that already exists for this exact
    -- engine + query, so the button is safe to press twice.
    IF NOT EXISTS (
      SELECT 1 FROM public.discoverability_tests d
      WHERE d.operator_id = p_operator_id
        AND d.phase = 'baseline'
        AND d.engine = r.engine
        AND d.query_text = r.query_text
    ) THEN
      INSERT INTO public.discoverability_tests
        (operator_id, phase, engine, query_text, notes)
      VALUES
        (p_operator_id, 'baseline', r.engine, r.query_text,
         'Auto-generated baseline. Run this exact query and update if the operator DOES appear.');
      n := n + 1;
    END IF;
  END LOOP;

  RETURN n;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.seed_baseline_tests(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_baseline_tests(UUID) TO authenticated, service_role;

-- ---------------------------------------------------------------
-- Pre-publish readiness report
-- ---------------------------------------------------------------
-- Answers "is it safe to make this crawlable?" in one call. Publishing
-- is irreversible in the sense that matters: once indexed, a wrong or
-- unconsented listing has already been read by machines.
CREATE OR REPLACE FUNCTION public.publish_readiness(p_operator_id UUID)
RETURNS TABLE (
  all_checks_passed BOOLEAN,
  identity_verified BOOLEAN,
  photo_gps_verified BOOLEAN,
  whatsapp_verified BOOLEAN,
  payout_verified BOOLEAN,
  has_room_types BOOLEAN,
  has_gps BOOLEAN,
  baseline_count INTEGER,
  has_baselines BOOLEAN,
  blocking_reasons TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  op RECORD;
  v_rooms INTEGER;
  v_baselines INTEGER;
  v_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  SELECT * INTO op FROM public.operators WHERE id = p_operator_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COUNT(*) INTO v_rooms FROM public.room_types WHERE operator_id = p_operator_id;
  SELECT COUNT(*) INTO v_baselines
    FROM public.discoverability_tests
   WHERE operator_id = p_operator_id AND phase = 'baseline';

  IF NOT op.identity_verified THEN
    v_reasons := v_reasons || 'Identity and ownership not confirmed — do not publish a business that has not agreed to be listed.';
  END IF;
  IF NOT op.photo_gps_verified THEN
    v_reasons := v_reasons || 'Photos not cross-checked against GPS location.';
  END IF;
  IF NOT op.whatsapp_verified THEN
    v_reasons := v_reasons || 'WhatsApp number not confirmed to reach a real person.';
  END IF;
  IF NOT op.payout_verified THEN
    v_reasons := v_reasons || 'Payout account not registered.';
  END IF;
  IF v_rooms = 0 THEN
    v_reasons := v_reasons || 'No room types with prices — the page would publish with no bookable offer.';
  END IF;
  IF op.lat IS NULL OR op.lng IS NULL THEN
    v_reasons := v_reasons || 'No GPS coordinates — map and location schema would be missing.';
  END IF;
  IF v_baselines = 0 THEN
    v_reasons := v_reasons || 'No AI-discoverability baseline captured. Once this page is indexed the "before" measurement is gone permanently.';
  END IF;

  RETURN QUERY SELECT
    (array_length(v_reasons, 1) IS NULL),
    op.identity_verified, op.photo_gps_verified, op.whatsapp_verified, op.payout_verified,
    (v_rooms > 0),
    (op.lat IS NOT NULL AND op.lng IS NOT NULL),
    v_baselines,
    (v_baselines > 0),
    v_reasons;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.publish_readiness(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_readiness(UUID) TO authenticated, service_role;
