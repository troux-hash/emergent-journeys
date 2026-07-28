CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  kind TEXT NOT NULL,
  detail TEXT NOT NULL,
  context JSONB,
  resolved_at TIMESTAMPTZ
);

COMMENT ON TABLE public.system_alerts IS
  'Operational problems that would otherwise fail silently -- missing secrets, skipped notifications. Surfaced in the intranet so they get noticed.';

CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved
  ON public.system_alerts (created_at DESC) WHERE resolved_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_system_alerts_one_open_per_kind
  ON public.system_alerts (kind) WHERE resolved_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_alerts TO authenticated;
GRANT ALL ON public.system_alerts TO service_role;

ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage system alerts" ON public.system_alerts;
CREATE POLICY "Admins manage system alerts"
  ON public.system_alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_system_alert(
  p_kind TEXT,
  p_detail TEXT,
  p_context JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.system_alerts (kind, detail, context)
  VALUES (p_kind, p_detail, p_context)
  ON CONFLICT (kind) WHERE resolved_at IS NULL
  DO UPDATE SET detail = EXCLUDED.detail,
                context = EXCLUDED.context,
                created_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_system_alert(TEXT, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_system_alert(TEXT, TEXT, JSONB) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.notify_new_operator_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fn_base_url text;
  svc_key text;
BEGIN
  SELECT decrypted_secret INTO fn_base_url
    FROM vault.decrypted_secrets WHERE name = 'project_functions_base_url' LIMIT 1;
  SELECT decrypted_secret INTO svc_key
    FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;

  IF fn_base_url IS NULL OR svc_key IS NULL THEN
    PERFORM public.log_system_alert(
      'lead_notification_skipped',
      'A new operator signed up but no notification was sent: a required Vault secret is missing. '
      || 'Add project_functions_base_url and/or email_queue_service_role_key, then contact this lead manually.',
      jsonb_build_object(
        'lead_id', NEW.id,
        'property_name', NEW.property_name,
        'has_base_url', fn_base_url IS NOT NULL,
        'has_service_key', svc_key IS NOT NULL
      )
    );
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(fn_base_url, '/') || '/notify-new-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || svc_key
    ),
    body := jsonb_build_object('lead_id', NEW.id)
  );

  UPDATE public.system_alerts
     SET resolved_at = now()
   WHERE kind = 'lead_notification_skipped' AND resolved_at IS NULL;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_pending_review_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fn_base_url text;
  svc_key text;
  booking RECORD;
  review_url text;
  sent_count int := 0;
BEGIN
  SELECT decrypted_secret INTO fn_base_url FROM vault.decrypted_secrets WHERE name = 'project_functions_base_url' LIMIT 1;
  SELECT decrypted_secret INTO svc_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;

  IF fn_base_url IS NULL OR svc_key IS NULL THEN
    PERFORM public.log_system_alert(
      'review_requests_skipped',
      'The post-stay review-request job is not running: a required Vault secret is missing '
      || '(project_functions_base_url and/or email_queue_service_role_key). Guests are not being asked for reviews.',
      jsonb_build_object('has_base_url', fn_base_url IS NOT NULL, 'has_service_key', svc_key IS NOT NULL)
    );
    RETURN;
  END IF;

  FOR booking IN
    SELECT b.id, b.guest_name, b.guest_email, b.review_token, o.name AS operator_name
    FROM public.bookings b
    JOIN public.operators o ON o.id = b.operator_id
    WHERE b.review_requested_at IS NULL
      AND b.check_out < CURRENT_DATE
      AND b.status <> 'cancelled'
    ORDER BY b.check_out ASC
    LIMIT 100
  LOOP
    review_url := 'https://fichua.co/review/' || booking.id || '?token=' || booking.review_token;

    PERFORM net.http_post(
      url := rtrim(fn_base_url, '/') || '/send-transactional-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || svc_key
      ),
      body := jsonb_build_object(
        'templateName', 'review-request',
        'recipientEmail', booking.guest_email,
        'idempotencyKey', 'review-request-' || booking.id,
        'templateData', jsonb_build_object(
          'guestName', booking.guest_name,
          'operatorName', booking.operator_name,
          'reviewUrl', review_url
        )
      )
    );

    UPDATE public.bookings SET review_requested_at = now() WHERE id = booking.id;
    sent_count := sent_count + 1;
  END LOOP;

  UPDATE public.system_alerts
     SET resolved_at = now()
   WHERE kind = 'review_requests_skipped' AND resolved_at IS NULL;

  IF sent_count > 0 THEN
    RAISE NOTICE 'send_pending_review_requests: queued % review request(s)', sent_count;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_email_channel_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fn_base_url text;
  svc_key text;
  v_email text;
BEGIN
  IF NEW.sender_type NOT IN ('agent', 'admin') THEN
    RETURN NEW;
  END IF;

  SELECT visitor_email INTO v_email
  FROM public.chat_messages
  WHERE session_id = NEW.session_id
    AND channel = 'email'
    AND visitor_email IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_email IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO fn_base_url FROM vault.decrypted_secrets WHERE name = 'project_functions_base_url' LIMIT 1;
  SELECT decrypted_secret INTO svc_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;

  IF fn_base_url IS NULL OR svc_key IS NULL THEN
    PERFORM public.log_system_alert(
      'email_reply_not_sent',
      'A reply was written to an email-originated conversation but could not be emailed out: '
      || 'a required Vault secret is missing. The person who wrote in has not received the reply.',
      jsonb_build_object('recipient', v_email, 'session_id', NEW.session_id)
    );
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(fn_base_url, '/') || '/send-transactional-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || svc_key
    ),
    body := jsonb_build_object(
      'templateName', 'chat-reply',
      'recipientEmail', v_email,
      'idempotencyKey', 'chat-reply-' || NEW.id,
      'templateData', jsonb_build_object('message', NEW.message)
    )
  );

  UPDATE public.system_alerts
     SET resolved_at = now()
   WHERE kind = 'email_reply_not_sent' AND resolved_at IS NULL;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.open_system_alerts()
RETURNS TABLE (id UUID, created_at TIMESTAMPTZ, kind TEXT, detail TEXT, context JSONB)
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
    SELECT a.id, a.created_at, a.kind, a.detail, a.context
    FROM public.system_alerts a
    WHERE a.resolved_at IS NULL
    ORDER BY a.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.open_system_alerts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.open_system_alerts() TO authenticated, service_role;