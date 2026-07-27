-- Delivery-linked cap on the monthly subscription.
--
-- The subscription is never more than a set share of the booking value
-- Fichua actually delivered that month. It only binds when Fichua
-- underdelivers, so it costs nothing in a good month -- and it extends
-- "you pay only when we deliver" beyond the first ten bookings into the
-- steady state.
--
-- The important consequence: if Fichua delivers nothing in a month, the
-- subscription for that month is ZERO. Not carried, not owed -- zero.
-- That removes the failure mode where a small guesthouse pays a flat fee
-- through a dead low season.
--
-- Three ceilings therefore apply, and the operator always pays the
-- lowest:
--   1. 3 x their average nightly rate   (the headline price)
--   2. the per-currency absolute cap    (USD 350)
--   3. this delivery-linked cap         (default 20% of delivered value)

CREATE TABLE IF NOT EXISTS public.billing_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  delivery_cap_percent NUMERIC NOT NULL DEFAULT 20
    CHECK (delivery_cap_percent > 0 AND delivery_cap_percent <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.billing_settings IS
  'Single-row billing configuration. delivery_cap_percent: the subscription never exceeds this share of the booking value Fichua delivered in the billing period.';

INSERT INTO public.billing_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.billing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage billing settings" ON public.billing_settings;
CREATE POLICY "Admins manage billing settings"
  ON public.billing_settings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE ON public.billing_settings TO authenticated;
GRANT ALL ON public.billing_settings TO service_role;

-- ---------------------------------------------------------------
-- What is actually due for a given month
-- ---------------------------------------------------------------
-- Returns the full working, not just a number: the operator (and you)
-- should be able to see which ceiling bound and why. A bill you can't
-- explain is a bill that gets disputed.
--
-- Period defaults to the current calendar month. Delivered value counts
-- bookings that are confirmed and not cancelled/refunded, attributed to
-- the month the booking was created.
CREATE OR REPLACE FUNCTION public.monthly_subscription_due(
  p_operator_id UUID,
  p_period_start DATE DEFAULT date_trunc('month', now())::date,
  p_period_end   DATE DEFAULT (date_trunc('month', now()) + INTERVAL '1 month')::date
)
RETURNS TABLE (
  period_start DATE,
  period_end DATE,
  subscription_base NUMERIC,      -- snapshotted headline price (already absolute-capped)
  delivered_value NUMERIC,        -- booking value Fichua delivered this period
  delivered_count INTEGER,
  delivery_cap_percent NUMERIC,
  delivery_cap_amount NUMERIC,    -- delivered_value * percent
  amount_due NUMERIC,             -- the lower of base and delivery cap
  capped_by TEXT,                 -- 'none' | 'delivery' | 'no_delivery'
  currency TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pct NUMERIC;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  SELECT bs.delivery_cap_percent INTO v_pct FROM public.billing_settings bs WHERE bs.id = 1;
  v_pct := COALESCE(v_pct, 20);

  RETURN QUERY
  WITH delivered AS (
    SELECT
      COALESCE(SUM(b.total_price), 0)::numeric AS val,
      COUNT(*)::int AS cnt,
      MIN(b.currency_snapshot) AS cur
    FROM public.bookings b
    WHERE b.operator_id = p_operator_id
      AND b.status = 'confirmed'
      AND b.created_at >= p_period_start
      AND b.created_at <  p_period_end
  ),
  op AS (
    SELECT o.subscription_price AS base, o.subscription_currency AS cur
    FROM public.operators o WHERE o.id = p_operator_id
  )
  SELECT
    p_period_start,
    p_period_end,
    COALESCE(op.base, 0),
    delivered.val,
    delivered.cnt,
    v_pct,
    ROUND(delivered.val * v_pct / 100, 2),
    -- The operator pays the LOWER of the headline price and the
    -- delivery cap. No delivery in the period means nothing is due.
    LEAST(COALESCE(op.base, 0), ROUND(delivered.val * v_pct / 100, 2)),
    CASE
      WHEN delivered.val = 0 THEN 'no_delivery'
      WHEN ROUND(delivered.val * v_pct / 100, 2) < COALESCE(op.base, 0) THEN 'delivery'
      ELSE 'none'
    END,
    COALESCE(op.cur, delivered.cur)
  FROM delivered, op;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.monthly_subscription_due(UUID, DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.monthly_subscription_due(UUID, DATE, DATE) TO authenticated, service_role;

-- ---------------------------------------------------------------
-- Surface this month's actual due amount on the dashboard
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
  is_verified BOOLEAN,
  -- current-month delivery-linked figures
  mtd_delivered_value NUMERIC,
  mtd_amount_due NUMERIC,
  mtd_capped_by TEXT
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
      o.is_verified,
      d.delivered_value,
      d.amount_due,
      d.capped_by
    FROM public.operators o
    LEFT JOIN LATERAL public.calculate_subscription_price(o.id) p ON TRUE
    LEFT JOIN LATERAL public.monthly_subscription_due(o.id) d ON TRUE
    ORDER BY o.name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.operator_lifecycle_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.operator_lifecycle_overview() TO authenticated, service_role;
