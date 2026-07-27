-- Operator lifecycle + subscription visibility (Stage 1).

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded'));

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (room_type_id WITH =, stay_range WITH &&)
  WHERE (status NOT IN ('cancelled', 'refunded'));

DO $$ BEGIN
  CREATE TYPE public.operator_lifecycle_stage AS ENUM (
    'lead', 'verifying', 'ready', 'live_free', 'live_subscribed', 'dormant', 'paused'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.operators
  ADD COLUMN IF NOT EXISTS lifecycle_stage public.operator_lifecycle_stage NOT NULL DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS subscription_price NUMERIC,
  ADD COLUMN IF NOT EXISTS subscription_currency TEXT,
  ADD COLUMN IF NOT EXISTS price_snapshot_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lifecycle_changed_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_operators_lifecycle_stage ON public.operators (lifecycle_stage);

COMMENT ON COLUMN public.operators.subscription_price IS
  'Snapshotted at billing start: 3 x unweighted average nightly rate. Not recomputed automatically -- see calculate_subscription_price().';

CREATE OR REPLACE FUNCTION public.delivered_booking_count(p_operator_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.bookings
  WHERE operator_id = p_operator_id
    AND status = 'confirmed';
$$;

CREATE OR REPLACE FUNCTION public.delivered_bookings_detail(p_operator_id UUID)
RETURNS TABLE (
  booking_id UUID,
  guest_name TEXT,
  check_in DATE,
  check_out DATE,
  total_price NUMERIC,
  currency TEXT,
  counted_at TIMESTAMPTZ
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
    SELECT b.id, b.guest_name, b.check_in, b.check_out,
           b.total_price, b.currency_snapshot, b.created_at
    FROM public.bookings b
    WHERE b.operator_id = p_operator_id
      AND b.status = 'confirmed'
    ORDER BY b.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_subscription_price(p_operator_id UUID)
RETURNS TABLE (price NUMERIC, currency TEXT, room_type_count INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROUND(AVG(rt.price_per_night) * 3, 2) AS price,
    MIN(rt.currency) AS currency,
    COUNT(*)::int AS room_type_count
  FROM public.room_types rt
  WHERE rt.operator_id = p_operator_id
  HAVING COUNT(*) > 0;
$$;

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

CREATE OR REPLACE FUNCTION public.trg_booking_lifecycle_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.evaluate_operator_lifecycle(COALESCE(NEW.operator_id, OLD.operator_id));
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS booking_lifecycle_refresh ON public.bookings;
CREATE TRIGGER booking_lifecycle_refresh
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.trg_booking_lifecycle_refresh();

CREATE OR REPLACE FUNCTION public.trg_operator_lifecycle_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.evaluate_operator_lifecycle(NEW.id);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS operator_lifecycle_refresh ON public.operators;
CREATE TRIGGER operator_lifecycle_refresh
  AFTER UPDATE OF status, identity_verified, photo_gps_verified,
                  whatsapp_verified, payout_verified
  ON public.operators
  FOR EACH ROW EXECUTE FUNCTION public.trg_operator_lifecycle_refresh();

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
    o.id,
    o.name,
    o.slug,
    o.status,
    o.lifecycle_stage,
    o.lifecycle_changed_at,
    EXTRACT(DAY FROM now() - o.lifecycle_changed_at)::int,
    public.delivered_booking_count(o.id),
    GREATEST(10 - public.delivered_booking_count(o.id), 0),
    o.subscription_price,
    o.subscription_currency,
    p.price,
    p.currency,
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

REVOKE EXECUTE ON FUNCTION public.delivered_booking_count(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delivered_bookings_detail(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.calculate_subscription_price(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.evaluate_operator_lifecycle(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.operator_lifecycle_overview() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.delivered_booking_count(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delivered_bookings_detail(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_subscription_price(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.evaluate_operator_lifecycle(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.operator_lifecycle_overview() TO authenticated, service_role;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.operators LOOP
    PERFORM public.evaluate_operator_lifecycle(r.id);
  END LOOP;
END $$;