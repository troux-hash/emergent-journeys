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
    RAISE NOTICE 'send_pending_review_requests: waiting on Vault secret(s) -- skipping';
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

  IF sent_count > 0 THEN
    RAISE NOTICE 'send_pending_review_requests: queued % review request(s)', sent_count;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.send_pending_review_requests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_pending_review_requests() TO service_role;

SELECT cron.schedule(
  'send-pending-review-requests',
  '0 * * * *',
  $cron$SELECT public.send_pending_review_requests();$cron$
);