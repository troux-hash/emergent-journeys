DROP FUNCTION IF EXISTS public.monthly_subscription_due(UUID, DATE, DATE);
DROP TABLE IF EXISTS public.billing_settings;
DROP TABLE IF EXISTS public.subscription_price_caps;

DROP FUNCTION IF EXISTS public.calculate_subscription_price(UUID);

CREATE OR REPLACE FUNCTION public.calculate_subscription_price(p_operator_id UUID)
RETURNS TABLE (
  price NUMERIC,
  cheapest_room_rate NUMERIC,
  currency TEXT,
  room_type_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROUND(MIN(rt.price_per_night) * 3, 2) AS price,
    MIN(rt.price_per_night) AS cheapest_room_rate,
    (SELECT r2.currency
       FROM public.room_types r2
      WHERE r2.operator_id = p_operator_id
      ORDER BY r2.price_per_night ASC, r2.id ASC
      LIMIT 1) AS currency,
    COUNT(*)::int AS room_type_count
  FROM public.room_types rt
  WHERE rt.operator_id = p_operator_id
  HAVING COUNT(*) > 0;
$$;

REVOKE EXECUTE ON FUNCTION public.calculate_subscription_price(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_subscription_price(UUID) TO authenticated, service_role;

COMMENT ON COLUMN public.operators.subscription_price IS
  'Snapshotted at billing start: 3 x the cheapest room nightly rate. Not recomputed automatically -- see calculate_subscription_price().';

DROP FUNCTION IF EXISTS public.operator_lifecycle_overview();

CREATE OR REPLACE FUNCTION public.operator_lifecycle_overview()
RETURNS TABLE (
  operator_id UUID,
  name TEXT,
  slug TEXT,
  status TEXT,
  lifecycle_stage public.operator_lifecycle_stage,
  lifecycle_changed_at TIMESTAMPTZ,
  days_in_stage INTEGER,
  delivered_bookings INTEGER,
  bookings_until_billing INTEGER,
  subscription_price NUMERIC,
  subscription_currency TEXT,
  projected_price NUMERIC,
  projected_currency TEXT,
  cheapest_room_rate NUMERIC,
  room_type_count INTEGER,
  billing_started_at TIMESTAMPTZ,
  last_booking_at TIMESTAMPTZ,
  is_verified BOOLEAN
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
    SELECT
      o.id, o.name, o.slug, o.status,
      o.lifecycle_stage, o.lifecycle_changed_at,
      EXTRACT(DAY FROM now() - o.lifecycle_changed_at)::int,
      public.delivered_booking_count(o.id),
      GREATEST(10 - public.delivered_booking_count(o.id), 0),
      o.subscription_price, o.subscription_currency,
      p.price, p.currency, p.cheapest_room_rate,
      COALESCE(p.room_type_count, 0),
      o.billing_started_at,
      (SELECT MAX(b.created_at) FROM public.bookings b
        WHERE b.operator_id = o.id AND b.status = 'confirmed'),
      o.is_verified
    FROM public.operators o
    LEFT JOIN LATERAL public.calculate_subscription_price(o.id) p ON TRUE
    ORDER BY o.name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.operator_lifecycle_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.operator_lifecycle_overview() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.evaluate_operator_lifecycle(p_operator_id UUID)
RETURNS public.operator_lifecycle_stage
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  op RECORD;
  v_count INTEGER;
  v_last_booking TIMESTAMPTZ;
  v_new_stage public.operator_lifecycle_stage;
  v_price RECORD;
BEGIN
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
END;
$$;

REVOKE EXECUTE ON FUNCTION public.evaluate_operator_lifecycle(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.evaluate_operator_lifecycle(UUID) TO authenticated, service_role;

DO $resnap$
DECLARE
  r RECORD;
  p RECORD;
BEGIN
  FOR r IN SELECT id, subscription_price FROM public.operators WHERE subscription_price IS NOT NULL LOOP
    SELECT * INTO p FROM public.calculate_subscription_price(r.id);
    IF p.price IS NOT NULL AND p.price < r.subscription_price THEN
      UPDATE public.operators
         SET subscription_price = p.price,
             subscription_currency = p.currency,
             price_snapshot_at = now()
       WHERE id = r.id;
    END IF;
  END LOOP;
END
$resnap$;