-- Enquiries: attribution + a response-time guarantee Fichua can actually keep.
--
-- THE DESIGN PROBLEM
-- Fichua deliberately stays out of the traveller/operator conversation --
-- travellers reach the operator on the operator's own WhatsApp and email.
-- But Fichua's promise is instant, reliable answers, and you cannot
-- promise a response time on a channel you can't see.
--
-- HOW THIS RESOLVES IT
-- Fichua doesn't watch the conversation. It watches the *handoff*:
--   1. Every "contact this operator" click creates an enquiry with a
--      short reference (FCH-XXXXXX) that appears in the traveller's
--      pre-filled first message. Visible to both sides, nothing hidden.
--   2. If the operator hasn't acknowledged within a grace window, Fichua
--      nudges the OPERATOR -- not the traveller. Fichua is coaching from
--      the sideline, not inserting itself into the thread.
--   3. Escalates to the Fichua team if still unanswered, so a dropped
--      enquiry becomes visible rather than silently lost.
--   4. Records response times, which produce an honest "typically replies
--      within X" signal on the listing -- computed from real behaviour,
--      not claimed.
--
-- Acknowledgement is operator-asserted (they tap a link, or reply on the
-- Fichua chat channel). Fichua cannot verify a reply sent on WhatsApp,
-- and this schema does not pretend otherwise: responded_at means "the
-- operator told us they responded", which is the honest limit of what a
-- non-intercepting design can know.

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,

  -- How the traveller chose to make contact.
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'chat', 'phone')),

  -- Optional: travellers are not asked to identify themselves before
  -- contacting an operator, so these may well be null.
  traveller_name TEXT,
  traveller_contact TEXT,
  initial_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Operator-asserted acknowledgement. See note above on its limits.
  responded_at TIMESTAMPTZ,
  responded_via TEXT,

  -- Escalation bookkeeping, so a nudge is never sent twice.
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

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can create an enquiry (a traveller clicking Contact is not
-- logged in), with the same length validation used elsewhere so the
-- endpoint can't be used as free text storage.
DROP POLICY IF EXISTS "Anyone can create an enquiry" ON public.enquiries;
CREATE POLICY "Anyone can create an enquiry"
  ON public.enquiries FOR INSERT TO anon, authenticated
  WITH CHECK (
    channel IN ('whatsapp', 'email', 'chat', 'phone')
    AND (traveller_name IS NULL OR char_length(traveller_name) <= 200)
    AND (traveller_contact IS NULL OR char_length(traveller_contact) <= 320)
    AND (initial_message IS NULL OR char_length(initial_message) <= 2000)
    AND responded_at IS NULL
    AND outcome = 'open'
  );

DROP POLICY IF EXISTS "Admins manage enquiries" ON public.enquiries;
CREATE POLICY "Admins manage enquiries"
  ON public.enquiries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- No public SELECT: an enquiry reference should not let anyone read
-- other travellers' enquiries.
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;

-- ---------------------------------------------------------------
-- Reference generation
-- ---------------------------------------------------------------
-- Short enough to type into a WhatsApp message, random enough not to be
-- guessable or sequential (a sequential reference would leak how many
-- enquiries Fichua has had, which is not information to hand out during
-- a pilot).
CREATE OR REPLACE FUNCTION public.generate_enquiry_reference()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I/O/0/1, avoids misreads
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

REVOKE EXECUTE ON FUNCTION public.generate_enquiry_reference() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_enquiry_reference() TO anon, authenticated, service_role;

-- ---------------------------------------------------------------
-- Public creation endpoint: returns the reference to show the traveller
-- ---------------------------------------------------------------
-- Wrapped in a function rather than a bare insert so the traveller's
-- browser can receive the generated reference back without needing
-- SELECT rights on the table.
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
  -- Only for listings that are actually live.
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

-- ---------------------------------------------------------------
-- Operator acknowledges, via a tokenless one-tap link
-- ---------------------------------------------------------------
-- The reference itself is the capability: it's random, it's already in
-- the operator's WhatsApp thread, and marking an enquiry answered is a
-- low-stakes action. Requiring a login here would guarantee it never
-- gets used.
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

  IF v_id IS NULL THEN
    RETURN false;  -- unknown reference, or already acknowledged
  END IF;

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

-- ---------------------------------------------------------------
-- Escalation: nudge the operator, then tell the team
-- ---------------------------------------------------------------
-- Run frequently by pg_cron. Two thresholds, both deliberately short --
-- the product claim is "almost instantly", and a nudge two hours later
-- is not that.
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
      'Enquiry response-time escalation is not running: a required Vault secret is missing. '
      || 'Travellers may be waiting on operators with no nudge being sent.',
      jsonb_build_object('has_base_url', fn_base_url IS NOT NULL, 'has_service_key', svc_key IS NOT NULL)
    );
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  -- Nudge the operator.
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
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || svc_key
      ),
      body := jsonb_build_object('enquiry_id', r.id, 'kind', 'operator_nudge')
    );
    UPDATE public.enquiries SET operator_nudged_at = now() WHERE id = r.id;
    v_nudged := v_nudged + 1;
  END LOOP;

  -- Still nothing: make it the team's problem, visibly.
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
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || svc_key
      ),
      body := jsonb_build_object('enquiry_id', r.id, 'kind', 'team_escalation')
    );
    UPDATE public.enquiries SET team_escalated_at = now() WHERE id = r.id;
    v_escalated := v_escalated + 1;
  END LOOP;

  UPDATE public.system_alerts
     SET resolved_at = now()
   WHERE kind = 'enquiry_escalation_skipped' AND resolved_at IS NULL;

  RETURN QUERY SELECT v_nudged, v_escalated;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.escalate_unanswered_enquiries(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.escalate_unanswered_enquiries(INT, INT) TO service_role;

-- ---------------------------------------------------------------
-- Admin-triggered escalation run
-- ---------------------------------------------------------------
-- escalate_unanswered_enquiries() is service_role-only on purpose: it
-- sends real messages to operators, so it should not be callable by any
-- logged-in user. But an admin watching the queue needs to be able to
-- push a stalled enquiry now rather than wait up to five minutes for
-- cron, and testing the nudge path otherwise means editing the schedule.
--
-- Hence this thin wrapper: an explicit admin check, then the same job.
-- The guard has to be here rather than inside the worker, because cron
-- runs with no authenticated user and auth.uid() is NULL there.
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

-- ---------------------------------------------------------------
-- Responsiveness, measured rather than claimed
-- ---------------------------------------------------------------
-- Median (not mean) so one holiday absence doesn't define an otherwise
-- responsive operator. Only exposed once there are enough data points to
-- mean something -- a "replies within 3 minutes" badge based on a single
-- enquiry would be worse than no badge.
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

-- ---------------------------------------------------------------
-- Admin view of the enquiry queue
-- ---------------------------------------------------------------
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
