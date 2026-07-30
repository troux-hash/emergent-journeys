-- 1. publish_readiness: text[] || 'literal' resolves to array || array and raises
--    "malformed array literal". Use array_append() for every concatenation.
CREATE OR REPLACE FUNCTION public.publish_readiness(p_operator_id uuid)
 RETURNS TABLE(all_checks_passed boolean, identity_verified boolean, photo_gps_verified boolean, whatsapp_verified boolean, payout_verified boolean, has_room_types boolean, has_gps boolean, baseline_count integer, has_baselines boolean, blocking_reasons text[])
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE op RECORD; v_rooms INTEGER; v_baselines INTEGER; v_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'admin role required'; END IF;
  SELECT * INTO op FROM public.operators WHERE id = p_operator_id;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT COUNT(*) INTO v_rooms FROM public.room_types WHERE operator_id = p_operator_id;
  SELECT COUNT(*) INTO v_baselines FROM public.discoverability_tests
   WHERE operator_id = p_operator_id AND phase = 'baseline';
  IF NOT op.identity_verified THEN v_reasons := array_append(v_reasons, 'Identity and ownership not confirmed — do not publish a business that has not agreed to be listed.'); END IF;
  IF NOT op.photo_gps_verified THEN v_reasons := array_append(v_reasons, 'Photos not cross-checked against GPS location.'); END IF;
  IF NOT op.whatsapp_verified THEN v_reasons := array_append(v_reasons, 'WhatsApp number not confirmed to reach a real person.'); END IF;
  IF NOT op.payout_verified THEN v_reasons := array_append(v_reasons, 'Payout account not registered.'); END IF;
  IF v_rooms = 0 THEN v_reasons := array_append(v_reasons, 'No room types with prices — the page would publish with no bookable offer.'); END IF;
  IF op.lat IS NULL OR op.lng IS NULL THEN v_reasons := array_append(v_reasons, 'No GPS coordinates — map and location schema would be missing.'); END IF;
  IF v_baselines = 0 THEN v_reasons := array_append(v_reasons, 'No AI-discoverability baseline captured. Once this page is indexed the "before" measurement is gone permanently.'); END IF;
  RETURN QUERY SELECT
    (array_length(v_reasons, 1) IS NULL),
    op.identity_verified, op.photo_gps_verified, op.whatsapp_verified, op.payout_verified,
    (v_rooms > 0), (op.lat IS NOT NULL AND op.lng IS NOT NULL),
    v_baselines, (v_baselines > 0), v_reasons;
END; $function$;

-- 2. In-body guards for the four previously unguarded SECURITY DEFINER functions.
--    Trigger / cron invocations have no signed-in user, so allow auth.uid() IS NULL.
CREATE OR REPLACE FUNCTION public.calculate_subscription_price(p_operator_id uuid)
 RETURNS TABLE(price numeric, cheapest_room_rate numeric, currency text, room_type_count integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;
  RETURN QUERY
    SELECT
      ROUND(MIN(rt.price_per_night) * 3, 2),
      MIN(rt.price_per_night),
      (SELECT r2.currency
         FROM public.room_types r2
        WHERE r2.operator_id = p_operator_id
        ORDER BY r2.price_per_night ASC, r2.id ASC
        LIMIT 1),
      COUNT(*)::int
    FROM public.room_types rt
    WHERE rt.operator_id = p_operator_id
    HAVING COUNT(*) > 0;
END; $function$;

CREATE OR REPLACE FUNCTION public.delivered_booking_count(p_operator_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_count INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;
  SELECT COUNT(*)::int INTO v_count
    FROM public.bookings
   WHERE operator_id = p_operator_id AND status = 'confirmed';
  RETURN v_count;
END; $function$;

CREATE OR REPLACE FUNCTION public.evaluate_operator_lifecycle(p_operator_id uuid)
 RETURNS operator_lifecycle_stage
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  op RECORD;
  v_count INTEGER;
  v_last_booking TIMESTAMPTZ;
  v_new_stage public.operator_lifecycle_stage;
  v_price RECORD;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  SELECT * INTO op FROM public.operators WHERE id = p_operator_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  IF op.lifecycle_stage = 'paused' THEN
    RETURN 'paused';
  END IF;

  v_count := public.delivered_booking_count(p_operator_id);

  SELECT MAX(created_at) INTO v_last_booking
  FROM public.bookings
  WHERE operator_id = p_operator_id AND status = 'confirmed';

  IF op.status <> 'published' THEN
    IF op.identity_verified AND op.photo_gps_verified
       AND op.whatsapp_verified AND op.payout_verified THEN
      v_new_stage := 'ready';
    ELSIF op.identity_verified OR op.photo_gps_verified
       OR op.whatsapp_verified OR op.payout_verified THEN
      v_new_stage := 'verifying';
    ELSE
      v_new_stage := 'lead';
    END IF;
  ELSIF v_count >= 10 THEN
    v_new_stage := 'live_subscribed';
  ELSIF v_last_booking IS NOT NULL AND v_last_booking < now() - INTERVAL '60 days' THEN
    v_new_stage := 'dormant';
  ELSE
    v_new_stage := 'live_free';
  END IF;

  IF v_new_stage = 'live_subscribed' AND op.billing_started_at IS NULL THEN
    SELECT * INTO v_price FROM public.calculate_subscription_price(p_operator_id);
    IF v_price.price IS NOT NULL AND v_price.price > 0 THEN
      UPDATE public.operators
         SET billing_started_at = now(),
             subscription_price = v_price.price,
             subscription_currency = v_price.currency,
             price_snapshot_at = now()
       WHERE id = p_operator_id;
    END IF;
  END IF;

  IF v_new_stage IS DISTINCT FROM op.lifecycle_stage THEN
    UPDATE public.operators
       SET lifecycle_stage = v_new_stage,
           lifecycle_changed_at = now()
     WHERE id = p_operator_id;
  END IF;

  RETURN v_new_stage;
END; $function$;

CREATE OR REPLACE FUNCTION public.log_system_alert(p_kind text, p_detail text, p_context jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  INSERT INTO public.system_alerts (kind, detail, context)
  VALUES (p_kind, p_detail, p_context)
  ON CONFLICT (kind) WHERE resolved_at IS NULL
  DO UPDATE SET detail = EXCLUDED.detail,
                context = EXCLUDED.context,
                created_at = now();
END; $function$;

-- 3. CREATE OR REPLACE preserves grants, but re-assert the intended shape
--    (defensive: a future DROP+CREATE would re-acquire Supabase defaults).
REVOKE EXECUTE ON FUNCTION public.calculate_subscription_price(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delivered_booking_count(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.evaluate_operator_lifecycle(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_system_alert(text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_subscription_price(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.delivered_booking_count(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.evaluate_operator_lifecycle(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_system_alert(text, text, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.publish_readiness(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_readiness(uuid) TO authenticated, service_role;