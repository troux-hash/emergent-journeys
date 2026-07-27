-- Monthly subscription cap.
--
-- The subscription is 3 x the operator's average nightly rate, but never
-- more than a fixed ceiling. Target operators average up to ~$200/night,
-- which would otherwise mean $600/month -- so in practice the cap binds
-- for most of them and the effective price becomes "3 nights, up to the
-- cap".
--
-- Caps are stored PER CURRENCY rather than as a single constant. A flat
-- "350" would be $350 to a USD operator and about 25 US cents to one
-- pricing in RWF, which would silently bill almost nothing. Storing them
-- explicitly means a currency without a configured cap is visible rather
-- than silently uncapped -- see operator_lifecycle_overview(), which
-- surfaces cap_applied and cap_amount so an uncapped currency shows up
-- on the dashboard instead of hiding.

CREATE TABLE IF NOT EXISTS public.subscription_price_caps (
  currency TEXT PRIMARY KEY,
  max_monthly_amount NUMERIC NOT NULL CHECK (max_monthly_amount > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscription_price_caps IS
  'Per-currency ceiling on the monthly subscription. A currency with no row here is NOT capped -- add a row before onboarding operators who price in it.';

INSERT INTO public.subscription_price_caps (currency, max_monthly_amount)
VALUES ('USD', 350)
ON CONFLICT (currency) DO NOTHING;

ALTER TABLE public.subscription_price_caps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage subscription caps" ON public.subscription_price_caps;
CREATE POLICY "Admins manage subscription caps"
  ON public.subscription_price_caps
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_price_caps TO authenticated;
GRANT ALL ON public.subscription_price_caps TO service_role;

-- ---------------------------------------------------------------
-- Apply the cap in the price calculation
-- ---------------------------------------------------------------
-- Returns both the uncapped and the final price so the admin UI can show
-- "would be $600, capped to $350" -- an operator should be able to see
-- the cap working in their favour, not just a number.
DROP FUNCTION IF EXISTS public.calculate_subscription_price(UUID);

CREATE OR REPLACE FUNCTION public.calculate_subscription_price(p_operator_id UUID)
RETURNS TABLE (
  price NUMERIC,
  uncapped_price NUMERIC,
  currency TEXT,
  room_type_count INTEGER,
  cap_amount NUMERIC,
  cap_applied BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      ROUND(AVG(rt.price_per_night) * 3, 2) AS raw_price,
      MIN(rt.currency) AS cur,
      COUNT(*)::int AS n
    FROM public.room_types rt
    WHERE rt.operator_id = p_operator_id
    HAVING COUNT(*) > 0
  )
  SELECT
    LEAST(base.raw_price, COALESCE(c.max_monthly_amount, base.raw_price)) AS price,
    base.raw_price AS uncapped_price,
    base.cur AS currency,
    base.n AS room_type_count,
    c.max_monthly_amount AS cap_amount,
    (c.max_monthly_amount IS NOT NULL AND base.raw_price > c.max_monthly_amount) AS cap_applied
  FROM base
  LEFT JOIN public.subscription_price_caps c ON c.currency = base.cur;
$$;

REVOKE EXECUTE ON FUNCTION public.calculate_subscription_price(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_subscription_price(UUID) TO authenticated, service_role;

-- ---------------------------------------------------------------
-- Surface the cap on the dashboard
-- ---------------------------------------------------------------
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
  projected_uncapped NUMERIC,
  projected_currency TEXT,
  cap_amount NUMERIC,
  cap_applied BOOLEAN,
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
      p.price, p.uncapped_price, p.currency,
      p.cap_amount, COALESCE(p.cap_applied, false),
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

-- ---------------------------------------------------------------
-- Lifecycle evaluation must snapshot the CAPPED price
-- ---------------------------------------------------------------
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
    -- v_price.price is already capped by calculate_subscription_price().
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

-- ---------------------------------------------------------------
-- Re-cap anyone already snapshotted above the ceiling
-- ---------------------------------------------------------------
-- Only ever lowers a price. An existing operator must never see their
-- bill go UP because of a cap being introduced.
UPDATE public.operators o
   SET subscription_price = c.max_monthly_amount,
       price_snapshot_at = now()
  FROM public.subscription_price_caps c
 WHERE o.subscription_currency = c.currency
   AND o.subscription_price IS NOT NULL
   AND o.subscription_price > c.max_monthly_amount;
