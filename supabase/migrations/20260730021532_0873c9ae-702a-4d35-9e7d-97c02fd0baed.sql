-- ---------------------------------------------------------------
-- confirm_booking: the missing state transition.
-- Nothing previously set status = 'confirmed'; the flow ended at
-- pending_operator and the operator confirmed verbally with no record.
-- ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.booking_reference(p_booking_id uuid)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 'FCH-B-' || upper(substr(replace(p_booking_id::text, '-', ''), 1, 8))
$$;
REVOKE EXECUTE ON FUNCTION public.booking_reference(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.booking_reference(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.confirm_booking(p_booking_id uuid)
RETURNS TABLE(booking_id uuid, reference text, status text, notified_traveller boolean, notified_operator boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  b public.bookings%ROWTYPE;
  op public.operators%ROWTYPE;
  rt public.room_types%ROWTYPE;
  v_ref text;
  v_nights integer;
  v_payload jsonb;
  fn_base_url text;
  svc_key text;
  v_suppressed boolean := false;
  v_sent_traveller boolean := false;
  v_sent_operator boolean := false;
BEGIN
  -- Access control. auth.uid() IS NULL covers service_role / cron callers.
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  BEGIN
    UPDATE public.bookings
       SET status = 'confirmed', updated_at = now()
     WHERE id = p_booking_id
       AND status IN ('pending_operator', 'awaiting_payment')
    RETURNING * INTO b;
  EXCEPTION WHEN exclusion_violation THEN
    -- 23P01 from bookings_no_overlap. Remap to something a human can act on.
    RAISE EXCEPTION 'Those dates are already confirmed for this room. Confirming this booking would double-sell the calendar.'
      USING ERRCODE = '22023';
  END;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found, or not in a confirmable state (only pending_operator or awaiting_payment can be confirmed).'
      USING ERRCODE = '22023';
  END IF;

  SELECT * INTO op FROM public.operators WHERE id = b.operator_id;
  SELECT * INTO rt FROM public.room_types WHERE id = b.room_type_id;

  v_ref := public.booking_reference(b.id);
  v_nights := (b.check_out - b.check_in);

  -- The identical record, built once and sent to both parties.
  v_payload := jsonb_build_object(
    'reference',      v_ref,
    'guestName',      b.guest_name,
    'guestWhatsapp',  b.guest_whatsapp,
    'operatorName',   op.name,
    'roomName',       rt.name,
    'checkIn',        to_char(b.check_in,  'YYYY-MM-DD'),
    'checkOut',       to_char(b.check_out, 'YYYY-MM-DD'),
    'nights',         v_nights,
    'guests',         b.guests,
    'currency',       b.currency_snapshot,
    'pricePerNight',  to_char(b.price_per_night_snapshot, 'FM999999990.00'),
    'total',          to_char(b.total_price, 'FM999999990.00')
  );

  SELECT decrypted_secret INTO fn_base_url FROM vault.decrypted_secrets WHERE name = 'project_functions_base_url' LIMIT 1;
  SELECT decrypted_secret INTO svc_key     FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;

  IF fn_base_url IS NULL OR svc_key IS NULL THEN
    PERFORM public.log_system_alert(
      'booking_confirmation_not_sent',
      'A booking was confirmed but neither party was emailed the record: a required Vault secret is missing. '
      || 'Send the confirmation manually and quote reference ' || v_ref || '.',
      jsonb_build_object('booking_id', b.id, 'reference', v_ref)
    );
    RETURN QUERY SELECT b.id, v_ref, b.status, false, false;
    RETURN;
  END IF;

  -- Traveller. A confirmation that silently fails is worse than none, so a
  -- suppressed address raises an alert instead of disappearing.
  SELECT EXISTS (SELECT 1 FROM public.suppressed_emails s WHERE s.email = lower(b.guest_email))
    INTO v_suppressed;

  IF v_suppressed THEN
    PERFORM public.log_system_alert(
      'booking_confirmation_undeliverable',
      'Booking ' || v_ref || ' was confirmed but the traveller''s email (' || b.guest_email
      || ') is on the suppression list, so no confirmation could be sent. Contact them on WhatsApp ('
      || COALESCE(b.guest_whatsapp, 'no number on file') || ') and send the record another way.',
      jsonb_build_object('booking_id', b.id, 'reference', v_ref, 'email', b.guest_email)
    );
  ELSE
    PERFORM net.http_post(
      url := rtrim(fn_base_url, '/') || '/send-transactional-email',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || svc_key),
      body := jsonb_build_object(
        'templateName', 'booking-confirmation',
        'recipientEmail', b.guest_email,
        'idempotencyKey', 'booking-confirm-traveller-' || b.id,
        'templateData', v_payload || jsonb_build_object('role', 'traveller')
      )
    );
    v_sent_traveller := true;
  END IF;

  -- Operator, by email. WhatsApp is a deliberate graceful no-op until Meta clears.
  IF op.email IS NOT NULL AND op.email <> '' THEN
    PERFORM net.http_post(
      url := rtrim(fn_base_url, '/') || '/send-transactional-email',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || svc_key),
      body := jsonb_build_object(
        'templateName', 'booking-confirmation',
        'recipientEmail', op.email,
        'idempotencyKey', 'booking-confirm-operator-' || b.id,
        'templateData', v_payload || jsonb_build_object('role', 'operator')
      )
    );
    v_sent_operator := true;
  ELSE
    PERFORM public.log_system_alert(
      'booking_confirmation_undeliverable',
      'Booking ' || v_ref || ' was confirmed but ' || COALESCE(op.name, 'the operator')
      || ' has no email address on file, so only the traveller holds the written record.',
      jsonb_build_object('booking_id', b.id, 'reference', v_ref, 'operator_id', op.id)
    );
  END IF;

  RETURN QUERY SELECT b.id, v_ref, b.status, v_sent_traveller, v_sent_operator;
END
$fn$;

REVOKE EXECUTE ON FUNCTION public.confirm_booking(uuid) FROM PUBLIC, anon;
-- Called from the intranet by a signed-in admin, i.e. as `authenticated`.
-- The grant only lets the request arrive; the in-body has_role guard is the control.
GRANT EXECUTE ON FUNCTION public.confirm_booking(uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------
-- A confirmation that bounces AFTER the fact must not vanish either.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.alert_on_confirmation_bounce()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $t$
DECLARE
  b RECORD;
BEGIN
  SELECT id, guest_name, guest_whatsapp, guest_email
    INTO b
    FROM public.bookings
   WHERE lower(guest_email) = lower(NEW.email)
     AND status = 'confirmed'
   ORDER BY updated_at DESC
   LIMIT 1;

  IF FOUND THEN
    PERFORM public.log_system_alert(
      'booking_confirmation_undeliverable',
      'A confirmation email for booking ' || public.booking_reference(b.id)
      || ' cannot reach ' || b.guest_email || ' (' || NEW.reason
      || '). The traveller may be holding no written record. Reach them on WhatsApp: '
      || COALESCE(b.guest_whatsapp, 'no number on file') || '.',
      jsonb_build_object('booking_id', b.id, 'email', NEW.email, 'reason', NEW.reason)
    );
  END IF;
  RETURN NEW;
END
$t$;
REVOKE EXECUTE ON FUNCTION public.alert_on_confirmation_bounce() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_alert_on_confirmation_bounce ON public.suppressed_emails;
CREATE TRIGGER trg_alert_on_confirmation_bounce
  AFTER INSERT ON public.suppressed_emails
  FOR EACH ROW EXECUTE FUNCTION public.alert_on_confirmation_bounce();

-- Admin needs to read bookings to drive the Confirm action.
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
CREATE POLICY "Admins can read all bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));