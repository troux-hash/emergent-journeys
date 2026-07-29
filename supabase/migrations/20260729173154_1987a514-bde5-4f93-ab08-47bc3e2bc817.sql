-- Server-side booking creation. Trust nothing from the client except identity, dates, room selection, and contact fields.
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
  -- Contact field bounds (mirrors old CHECK expression, kept as belt-and-braces)
  IF p_guest_name IS NULL OR length(btrim(p_guest_name)) < 1 OR length(btrim(p_guest_name)) > 100 THEN
    RAISE EXCEPTION 'invalid guest_name' USING ERRCODE = '22023';
  END IF;
  IF p_guest_email IS NULL OR position('@' in p_guest_email) = 0 OR length(p_guest_email) > 255 THEN
    RAISE EXCEPTION 'invalid guest_email' USING ERRCODE = '22023';
  END IF;
  IF p_guest_whatsapp IS NULL OR length(btrim(p_guest_whatsapp)) < 1 OR length(btrim(p_guest_whatsapp)) > 40 THEN
    RAISE EXCEPTION 'invalid guest_whatsapp' USING ERRCODE = '22023';
  END IF;

  -- Date sanity. No past-dated bookings (they were poisoning delivered-booking counts that drive billing).
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

  -- Operator must exist and be published. Prevents booking draft/paused listings.
  SELECT id, status INTO v_op FROM public.operators WHERE id = p_operator_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'operator not found' USING ERRCODE = '22023';
  END IF;
  IF v_op.status <> 'published' THEN
    RAISE EXCEPTION 'operator is not accepting bookings' USING ERRCODE = '22023';
  END IF;

  -- Room must belong to that operator. Prevents cross-operator confusion + price grafting.
  SELECT id, operator_id, price_per_night, currency, max_guests
    INTO v_room
    FROM public.room_types
    WHERE id = p_room_type_id;
  IF NOT FOUND OR v_room.operator_id <> p_operator_id THEN
    RAISE EXCEPTION 'room_type does not belong to operator' USING ERRCODE = '22023';
  END IF;

  -- Guest count bounds against the room's real capacity.
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
    'pending',
    NULLIF(p_utm_source, ''), NULLIF(p_utm_medium, ''), NULLIF(p_utm_campaign, '')
  )
  RETURNING id, bookings.review_token INTO v_id, v_token;

  RETURN QUERY SELECT v_id, v_token;
END;
$$;

REVOKE ALL ON FUNCTION public.create_booking(uuid, uuid, text, text, text, integer, date, date, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking(uuid, uuid, text, text, text, integer, date, date, text, text, text, text) TO anon, authenticated;

-- Remove the direct-insert path that trusted client-supplied total_price/dates/status.
DROP POLICY IF EXISTS "Anyone can request a booking" ON public.bookings;

COMMENT ON FUNCTION public.create_booking(uuid, uuid, text, text, text, integer, date, date, text, text, text, text) IS
  'Only path for guests to create bookings. Validates operator status, room ownership, dates (no past, <=30 nights), guest bounds, and computes total_price server-side from room_types. Replaces the anon INSERT policy that trusted client input.';
