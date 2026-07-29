-- Enquiries system + insert hardening (combined)

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'chat', 'phone')),
  traveller_name TEXT,
  traveller_contact TEXT,
  initial_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  responded_via TEXT,
  operator_nudged_at TIMESTAMPTZ,
  team_escalated_at TIMESTAMPTZ,
  outcome TEXT NOT NULL DEFAULT 'open'
    CHECK (outcome IN ('open', 'responded', 'booked', 'lost', 'spam'))
);

CREATE INDEX IF NOT EXISTS idx_enquiries_operator ON public.enquiries (operator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_unanswered
  ON public.enquiries (created_at) WHERE responded_at IS NULL;

COMMENT ON TABLE public.enquiries IS
  'One row per traveller contact attempt. Tracks the handoff to the operator, not the conversation itself.';
COMMENT ON COLUMN public.enquiries.responded_at IS
  'Operator-asserted. Fichua cannot observe replies sent on the operator''s own WhatsApp.';

-- Grants (hardening applied inline: anon does NOT get INSERT).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage enquiries" ON public.enquiries;
CREATE POLICY "Admins manage enquiries"
  ON public.enquiries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Belt and braces: if anyone ever re-grants INSERT to a role, this policy
-- still forces the published-operator check that lives in create_enquiry.
DROP POLICY IF EXISTS "Enquiries for published operators only" ON public.enquiries;
CREATE POLICY "Enquiries for published operators only"
  ON public.enquiries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.operators o
       WHERE o.id = enquiries.operator_id AND o.status = 'published'
    )
    AND channel IN ('whatsapp', 'email', 'chat', 'phone')
    AND (traveller_name IS NULL OR char_length(traveller_name) <= 200)
    AND (traveller_contact IS NULL OR char_length(traveller_contact) <= 320)
    AND (initial_message IS NULL OR char_length(initial_message) <= 2000)
    AND responded_at IS NULL
    AND outcome = 'open'
  );

-- Reference generator (SECURITY DEFINER so create_enquiry chain works).
CREATE OR REPLACE FUNCTION public.generate_enquiry_reference()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate TEXT;
  i INT;
BEGIN
  LOOP
    candidate := 'FCH-';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.enquiries WHERE reference = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

ALTER TABLE public.enquiries
  ALTER COLUMN reference SET DEFAULT public.generate_enquiry_reference();

REVOKE EXECUTE ON FUNCTION public.generate_enquiry_reference() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_enquiry_reference() TO service_role;

-- Public creation endpoint.
CREATE OR REPLACE FUNCTION public.create_enquiry(
  p_operator_id UUID,
  p_channel TEXT,
  p_initial_message TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.operators
    WHERE id = p_operator_id AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'operator not available';
  END IF;

  IF p_channel NOT IN ('whatsapp', 'email', 'chat', 'phone') THEN
    RAISE EXCEPTION 'invalid channel';
  END IF;

  INSERT INTO public.enquiries (operator_id, channel, initial_message)
  VALUES (p_operator_id, p_channel, left(COALESCE(p_initial_message, ''), 2000))
  RETURNING reference INTO v_ref;

  RETURN v_ref;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_enquiry(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_enquiry(UUID, TEXT, TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.create_enquiry(UUID, TEXT, TEXT) IS
  'The only supported way to create an enquiry. Direct inserts are revoked for anon deliberately: the published-operator check lives here.';

-- Operator acknowledges via one-tap link (reference is the capability).
CREATE OR REPLACE FUNCTION public.acknowledge_enquiry(
  p_reference TEXT,
  p_via TEXT DEFAULT 'whatsapp'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.enquiries
   WHERE reference = upper(btrim(p_reference)) AND responded_at IS NULL;
  IF v_id IS NULL THEN RETURN false; END IF;

  UPDATE public.enquiries
     SET responded_at = now(),
         responded_via = left(COALESCE(p_via, 'whatsapp'), 40),
         outcome = CASE WHEN outcome = 'open' THEN 'responded' ELSE outcome END
   WHERE id = v_id;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.acknowledge_enquiry(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acknowledge_enquiry(TEXT, TEXT) TO anon, authenticated, service_role;

-- Escalation worker.
CREATE OR REPLACE FUNCTION public.escalate_unanswered_enquiries(
  p_nudge_after_minutes INT DEFAULT 15,
  p_escalate_after_minutes INT DEFAULT 60
)
RETURNS TABLE (nudged INT, escalated INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fn_base_url text;
  svc_key text;
  r RECORD;
  v_nudged INT := 0;
  v_escalated INT := 0;
BEGIN
  SELECT decrypted_secret INTO fn_base_url FROM vault.decrypted_secrets WHERE name = 'project_functions_base_url' LIMIT 1;
  SELECT decrypted_secret INTO svc_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;

  IF fn_base_url IS NULL OR svc_key IS NULL THEN
    PERFORM public.log_system_alert(
      'enquiry_escalation_skipped',
      'Enquiry response-time escalation is not running: a required Vault secret is missing. Travellers may be waiting on operators with no nudge being sent.',
      jsonb_build_object('has_base_url', fn_base_url IS NOT NULL, 'has_service_key', svc_key IS NOT NULL)
    );
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  FOR r IN
    SELECT e.id, e.reference, e.operator_id
    FROM public.enquiries e
    WHERE e.responded_at IS NULL
      AND e.operator_nudged_at IS NULL
      AND e.outcome = 'open'
      AND e.created_at < now() - make_interval(mins => p_nudge_after_minutes)
    LIMIT 200
  LOOP
    PERFORM net.http_post(
      url := rtrim(fn_base_url, '/') || '/enquiry-nudge',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || svc_key),
      body := jsonb_build_object('enquiry_id', r.id, 'kind', 'operator_nudge')
    );
    UPDATE public.enquiries SET operator_nudged_at = now() WHERE id = r.id;
    v_nudged := v_nudged + 1;
  END LOOP;

  FOR r IN
    SELECT e.id, e.reference, e.operator_id
    FROM public.enquiries e
    WHERE e.responded_at IS NULL
      AND e.team_escalated_at IS NULL
      AND e.outcome = 'open'
      AND e.created_at < now() - make_interval(mins => p_escalate_after_minutes)
    LIMIT 200
  LOOP
    PERFORM net.http_post(
      url := rtrim(fn_base_url, '/') || '/enquiry-nudge',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || svc_key),
      body := jsonb_build_object('enquiry_id', r.id, 'kind', 'team_escalation')
    );
    UPDATE public.enquiries SET team_escalated_at = now() WHERE id = r.id;
    v_escalated := v_escalated + 1;
  END LOOP;

  UPDATE public.system_alerts SET resolved_at = now()
   WHERE kind = 'enquiry_escalation_skipped' AND resolved_at IS NULL;

  RETURN QUERY SELECT v_nudged, v_escalated;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.escalate_unanswered_enquiries(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.escalate_unanswered_enquiries(INT, INT) TO service_role;

-- Admin-triggered wrapper (cron runs the worker directly; this is for the UI).
CREATE OR REPLACE FUNCTION public.run_enquiry_escalation()
RETURNS TABLE (nudged INT, escalated INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;
  RETURN QUERY SELECT * FROM public.escalate_unanswered_enquiries();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.run_enquiry_escalation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.run_enquiry_escalation() TO authenticated, service_role;

SELECT cron.schedule(
  'escalate-unanswered-enquiries',
  '*/5 * * * *',
  $cron$SELECT public.escalate_unanswered_enquiries();$cron$
);

-- Responsiveness stats.
CREATE OR REPLACE FUNCTION public.operator_responsiveness(p_operator_id UUID)
RETURNS TABLE (
  answered_count INTEGER,
  total_count INTEGER,
  median_minutes NUMERIC,
  answered_within_hour_pct NUMERIC,
  is_publishable BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH e AS (
    SELECT responded_at, created_at,
           EXTRACT(EPOCH FROM (responded_at - created_at)) / 60 AS mins
    FROM public.enquiries
    WHERE operator_id = p_operator_id AND outcome <> 'spam'
  )
  SELECT
    COUNT(*) FILTER (WHERE responded_at IS NOT NULL)::int,
    COUNT(*)::int,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY mins) FILTER (WHERE mins IS NOT NULL)::numeric, 1),
    CASE WHEN COUNT(*) FILTER (WHERE responded_at IS NOT NULL) > 0
      THEN ROUND(100.0 * COUNT(*) FILTER (WHERE mins <= 60) / COUNT(*) FILTER (WHERE responded_at IS NOT NULL), 0)
      ELSE NULL END,
    (COUNT(*) FILTER (WHERE responded_at IS NOT NULL) >= 5)
  FROM e;
$$;

REVOKE EXECUTE ON FUNCTION public.operator_responsiveness(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.operator_responsiveness(UUID) TO anon, authenticated, service_role;

-- Admin queue view.
CREATE OR REPLACE FUNCTION public.enquiry_queue()
RETURNS TABLE (
  id UUID,
  reference TEXT,
  operator_id UUID,
  operator_name TEXT,
  channel TEXT,
  initial_message TEXT,
  created_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  minutes_waiting NUMERIC,
  operator_nudged_at TIMESTAMPTZ,
  team_escalated_at TIMESTAMPTZ,
  outcome TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;
  RETURN QUERY
    SELECT e.id, e.reference, e.operator_id, o.name, e.channel, e.initial_message,
           e.created_at, e.responded_at,
           ROUND(EXTRACT(EPOCH FROM (COALESCE(e.responded_at, now()) - e.created_at)) / 60, 1),
           e.operator_nudged_at, e.team_escalated_at, e.outcome
    FROM public.enquiries e
    JOIN public.operators o ON o.id = e.operator_id
    ORDER BY (e.responded_at IS NULL) DESC, e.created_at DESC
    LIMIT 500;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enquiry_queue() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enquiry_queue() TO authenticated, service_role;