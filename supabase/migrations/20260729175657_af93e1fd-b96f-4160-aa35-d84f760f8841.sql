-- 1) Expire pending_operator bookings on either TTL or dates-passed condition,
--    and pass a reason to the guest email so wording matches the situation.
CREATE OR REPLACE FUNCTION public.expire_stale_pending_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer := 0;
  v_row RECORD;
  v_operator_url text;
  v_reason text;
BEGIN
  FOR v_row IN
    UPDATE public.bookings b
       SET status = 'expired', updated_at = now()
      FROM public.operators o
     WHERE b.operator_id = o.id
       AND b.status = 'pending_operator'
       AND (b.created_at < now() - interval '7 days'
            OR b.check_in < CURRENT_DATE)
     RETURNING b.id, b.guest_name, b.guest_email, b.check_in, b.check_out,
               o.name AS operator_name, o.slug AS operator_slug
  LOOP
    v_count := v_count + 1;
    v_operator_url := 'https://fichua.co/operators/' || v_row.operator_slug;
    v_reason := CASE WHEN v_row.check_in < CURRENT_DATE
                     THEN 'dates_passed' ELSE 'unconfirmed' END;

    PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
      'templateName', 'booking-expired',
      'to', v_row.guest_email,
      'idempotencyKey', 'booking-expired-' || v_row.id,
      'data', jsonb_build_object(
        'guestName', v_row.guest_name,
        'operatorName', v_row.operator_name,
        'operatorUrl', v_operator_url,
        'checkIn', to_char(v_row.check_in, 'YYYY-MM-DD'),
        'checkOut', to_char(v_row.check_out, 'YYYY-MM-DD'),
        'reason', v_reason
      )
    ));
  END LOOP;
  RETURN v_count;
END;
$function$;

-- 2) create_booking now rejects dates already held by a confirmed /
--    awaiting_payment booking. SECURITY DEFINER runs as owner so the
--    revoke of check_room_availability from anon/authenticated does not
--    apply here. UI never calls check_room_availability directly today
--    (verified: no src/ references), so leaving that grant revoked is
--    the right call until we build a calendar UI.
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
SET search_path TO 'public'
AS $function$
DECLARE
  v_operator public.operators%ROWTYPE;
  v_room public.room_types%ROWTYPE;
  v_nights integer;
  v_total numeric;
  v_booking_id uuid;
  v_review_token uuid;
BEGIN
  IF p_check_in < CURRENT_DATE THEN
    RAISE EXCEPTION 'Check-in date cannot be in the past' USING ERRCODE = '22023';
  END IF;
  IF p_check_out <= p_check_in THEN
    RAISE EXCEPTION 'Check-out must be after check-in' USING ERRCODE = '22023';
  END IF;
  IF p_guests < 1 THEN
    RAISE EXCEPTION 'At least one guest is required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_operator FROM public.operators WHERE id = p_operator_id;
  IF NOT FOUND OR v_operator.status <> 'published' THEN
    RAISE EXCEPTION 'Operator not available for booking' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_room FROM public.room_types
    WHERE id = p_room_type_id AND operator_id = p_operator_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room type does not belong to this operator' USING ERRCODE = '22023';
  END IF;

  IF p_guests > v_room.max_guests THEN
    RAISE EXCEPTION 'Guest count exceeds room capacity' USING ERRCODE = '22023';
  END IF;
  IF v_room.price_per_night IS NULL OR v_room.price_per_night <= 0 THEN
    RAISE EXCEPTION 'Room price is not set' USING ERRCODE = '22023';
  END IF;

  -- Reject dates already held by a confirmed / awaiting_payment booking.
  -- pending_operator enquiries no longer hold the calendar, so they are
  -- intentionally NOT considered here.
  IF NOT public.check_room_availability(p_room_type_id, p_check_in, p_check_out) THEN
    RAISE EXCEPTION 'Those dates are no longer available for this room' USING ERRCODE = '22023';
  END IF;

  v_nights := (p_check_out - p_check_in);
  v_total := v_room.price_per_night * v_nights;
  v_review_token := gen_random_uuid();

  INSERT INTO public.bookings (
    operator_id, room_type_id, guest_name, guest_email, guest_whatsapp,
    guests, special_requests, check_in, check_out,
    price_per_night_snapshot, currency_snapshot, total_price,
    status, review_token, utm_source, utm_medium, utm_campaign
  ) VALUES (
    p_operator_id, p_room_type_id, p_guest_name, p_guest_email, p_guest_whatsapp,
    p_guests, p_special_requests, p_check_in, p_check_out,
    v_room.price_per_night, v_room.currency, v_total,
    'pending_operator', v_review_token, p_utm_source, p_utm_medium, p_utm_campaign
  ) RETURNING id INTO v_booking_id;

  RETURN QUERY SELECT v_booking_id, v_review_token;
END;
$function$;