-- =========================================================================
-- Booking state machine redesign.
--
-- Problem this migration fixes:
--   The old bookings_no_overlap constraint excluded only 'cancelled' and
--   'refunded', so a 'pending' booking held the room's calendar. That made
--   an anon-callable create_booking a free calendar-squatting primitive.
--   The obvious mitigation (aggressive TTL) would have destroyed real
--   bookings, because pending -> confirmed is a manual operator action
--   done over WhatsApp on human timelines.
--
-- Fix: change WHAT holds inventory, not how fast we destroy things.
--   Only 'confirmed' and 'awaiting_payment' hold the calendar. Enquiries
--   ('pending_operator') hold nothing. The TTL becomes pure housekeeping.
-- =========================================================================

-- 1. Widen the status CHECK to include the new values.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'pending_operator',   -- form submitted, awaiting operator WhatsApp confirmation
    'awaiting_payment',   -- (future) payment session opened, awaiting webhook
    'confirmed',          -- stay agreed
    'expired',            -- auto-swept enquiry, distinct from cancelled
    'cancelled',          -- explicit cancel by operator or guest
    'refunded'            -- money returned
  ));

-- 2. Migrate any existing 'pending' rows to 'pending_operator'. There are
--    only enquiries in this state today; no operator flow assumes 'pending'.
UPDATE public.bookings SET status = 'pending_operator' WHERE status = 'pending';

-- 3. Rebuild the overlap constraint. Only confirmed + awaiting_payment
--    hold the room. Enquiries do not.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (room_type_id WITH =, stay_range WITH &&)
  WHERE (status IN ('confirmed', 'awaiting_payment'));

-- 4. Availability check must match the new predicate, or the UI shows
--    rooms as taken that are merely enquired about.
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_type_id UUID, p_check_in DATE, p_check_out DATE
) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.room_type_id = p_room_type_id
      AND b.status IN ('confirmed', 'awaiting_payment')
      AND b.stay_range && daterange(p_check_in, p_check_out, '[)')
  );
$$;
-- Grants unchanged from prior migration (admin-only via 20260727110843).

-- 5. create_booking now writes 'pending_operator' instead of 'pending'.
--    Signature and validation unchanged from 20260729173154.
CREATE OR REPLACE FUNCTION public.create_booking(
  p_operator_id uuid,
  p_room_type_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_whatsapp text,
  p_guests integer,
  p_check_in date,
  p_check_out date,
  p_special_requests text DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL
)
RETURNS TABLE(booking_id uuid, review_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_op RECORD;
  v_room RECORD;
  v_nights integer;
  v_total numeric;
  v_id uuid;
  v_token uuid;
BEGIN
  IF p_guest_name IS NULL OR length(btrim(p_guest_name)) < 1 OR length(btrim(p_guest_name)) > 100 THEN
    RAISE EXCEPTION 'invalid guest_name' USING ERRCODE = '22023';
  END IF;
  IF p_guest_email IS NULL OR position('@' in p_guest_email) = 0 OR length(p_guest_email) > 255 THEN
    RAISE EXCEPTION 'invalid guest_email' USING ERRCODE = '22023';
  END IF;
  IF p_guest_whatsapp IS NULL OR length(btrim(p_guest_whatsapp)) < 1 OR length(btrim(p_guest_whatsapp)) > 40 THEN
    RAISE EXCEPTION 'invalid guest_whatsapp' USING ERRCODE = '22023';
  END IF;

  IF p_check_in IS NULL OR p_check_out IS NULL THEN
    RAISE EXCEPTION 'check_in and check_out are required' USING ERRCODE = '22023';
  END IF;
  IF p_check_in < CURRENT_DATE THEN
    RAISE EXCEPTION 'check_in cannot be in the past' USING ERRCODE = '22023';
  END IF;
  IF p_check_out <= p_check_in THEN
    RAISE EXCEPTION 'check_out must be after check_in' USING ERRCODE = '22023';
  END IF;
  v_nights := (p_check_out - p_check_in);
  IF v_nights > 30 THEN
    RAISE EXCEPTION 'stays longer than 30 nights are not supported via direct booking' USING ERRCODE = '22023';
  END IF;

  SELECT id, status INTO v_op FROM public.operators WHERE id = p_operator_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'operator not found' USING ERRCODE = '22023';
  END IF;
  IF v_op.status <> 'published' THEN
    RAISE EXCEPTION 'operator is not accepting bookings' USING ERRCODE = '22023';
  END IF;

  SELECT id, operator_id, price_per_night, currency, max_guests
    INTO v_room FROM public.room_types WHERE id = p_room_type_id;
  IF NOT FOUND OR v_room.operator_id <> p_operator_id THEN
    RAISE EXCEPTION 'room_type does not belong to operator' USING ERRCODE = '22023';
  END IF;

  IF p_guests IS NULL OR p_guests < 1 OR p_guests > v_room.max_guests THEN
    RAISE EXCEPTION 'guests must be between 1 and the room max_guests' USING ERRCODE = '22023';
  END IF;

  IF v_room.price_per_night IS NULL OR v_room.price_per_night <= 0 THEN
    RAISE EXCEPTION 'room has no valid price' USING ERRCODE = '22023';
  END IF;
  v_total := v_room.price_per_night * v_nights;

  INSERT INTO public.bookings (
    operator_id, room_type_id, guest_name, guest_email, guest_whatsapp,
    guests, special_requests, check_in, check_out,
    price_per_night_snapshot, currency_snapshot, total_price,
    status, utm_source, utm_medium, utm_campaign
  ) VALUES (
    p_operator_id, p_room_type_id, btrim(p_guest_name), p_guest_email, btrim(p_guest_whatsapp),
    p_guests, NULLIF(btrim(coalesce(p_special_requests, '')), ''), p_check_in, p_check_out,
    v_room.price_per_night, v_room.currency, v_total,
    'pending_operator',
    NULLIF(p_utm_source, ''), NULLIF(p_utm_medium, ''), NULLIF(p_utm_campaign, '')
  )
  RETURNING id, bookings.review_token INTO v_id, v_token;

  RETURN QUERY SELECT v_id, v_token;
END;
$$;
-- Grants unchanged (anon + authenticated EXECUTE, PUBLIC revoked).

-- 6. Expiry sweep. 7-day TTL, marks 'expired' (not 'cancelled'), enqueues
--    a guest email so silent auto-cancellation is not a thing.
--    awaiting_payment is deliberately NOT touched -- payment providers
--    manage their own session TTL and the state flip is webhook-driven.
CREATE OR REPLACE FUNCTION public.expire_stale_pending_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  v_row RECORD;
  v_operator_url text;
BEGIN
  FOR v_row IN
    UPDATE public.bookings b
       SET status = 'expired', updated_at = now()
      FROM public.operators o
     WHERE b.operator_id = o.id
       AND b.status = 'pending_operator'
       AND b.created_at < now() - interval '7 days'
     RETURNING b.id, b.guest_name, b.guest_email, b.check_in, b.check_out,
               o.name AS operator_name, o.slug AS operator_slug
  LOOP
    v_count := v_count + 1;
    v_operator_url := 'https://fichua.co/operators/' || v_row.operator_slug;

    PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
      'templateName', 'booking-expired',
      'to', v_row.guest_email,
      'idempotencyKey', 'booking-expired-' || v_row.id,
      'data', jsonb_build_object(
        'guestName', v_row.guest_name,
        'operatorName', v_row.operator_name,
        'operatorUrl', v_operator_url,
        'checkIn', to_char(v_row.check_in, 'YYYY-MM-DD'),
        'checkOut', to_char(v_row.check_out, 'YYYY-MM-DD')
      )
    ));
  END LOOP;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_pending_bookings() FROM PUBLIC;

COMMENT ON FUNCTION public.expire_stale_pending_bookings() IS
  'TTL sweep: marks pending_operator bookings older than 7 days as expired '
  '(NOT cancelled) and notifies the guest by email. Never touches '
  'awaiting_payment -- payment expiry is webhook-driven, not cron-driven. '
  'With bookings_no_overlap gated on (confirmed, awaiting_payment), this '
  'is housekeeping, not a security control.';

-- 7. Reschedule cron: hourly is plenty for a 7-day TTL, and cheaper than 5-min.
DO $$
DECLARE
  v_jobid bigint;
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'expire-stale-pending-bookings';
  IF v_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_jobid);
  END IF;
END $$;

SELECT cron.schedule(
  'expire-stale-pending-bookings',
  '0 * * * *',
  $$SELECT public.expire_stale_pending_bookings();$$
);

-- 8. Tighten review-request job: only confirmed stays should be asked for a
--    review. Previously used status <> 'cancelled', which would have swept
--    up expired enquiries once the new status exists.
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
  sent_count integer := 0;
BEGIN
  SELECT decrypted_secret INTO fn_base_url FROM vault.decrypted_secrets WHERE name = 'project_functions_base_url';
  SELECT decrypted_secret INTO svc_key FROM vault.decrypted_secrets WHERE name = 'service_role_key';

  IF fn_base_url IS NULL OR svc_key IS NULL THEN
    INSERT INTO public.system_alerts (kind, detail, context)
    SELECT
      'review_requests_skipped',
      'The post-stay review-request job is not running: a required Vault secret is missing '
      || '(project_functions_base_url and/or service_role_key). Reinstate them to resume.',
      jsonb_build_object('fn_base_url_present', fn_base_url IS NOT NULL, 'svc_key_present', svc_key IS NOT NULL)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.system_alerts WHERE kind = 'review_requests_skipped' AND resolved_at IS NULL
    );
    RETURN;
  END IF;

  FOR booking IN
    SELECT b.id, b.guest_name, b.guest_email, b.review_token, o.name AS operator_name
    FROM public.bookings b
    JOIN public.operators o ON o.id = b.operator_id
    WHERE b.review_requested_at IS NULL
      AND b.check_out < CURRENT_DATE
      AND b.status = 'confirmed'   -- tightened from `<> 'cancelled'`
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
        'to', booking.guest_email,
        'idempotencyKey', 'review-request-' || booking.id,
        'data', jsonb_build_object(
          'guestName', booking.guest_name,
          'operatorName', booking.operator_name,
          'reviewUrl', review_url
        )
      )
    );

    UPDATE public.bookings SET review_requested_at = now() WHERE id = booking.id;
    sent_count := sent_count + 1;
  END LOOP;

  UPDATE public.system_alerts SET resolved_at = now()
   WHERE kind = 'review_requests_skipped' AND resolved_at IS NULL;

  IF sent_count > 0 THEN
    RAISE NOTICE 'send_pending_review_requests: queued % review request(s)', sent_count;
  END IF;
END;
$$;