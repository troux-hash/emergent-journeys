-- Operator lifecycle + subscription visibility (Stage 1).
--
-- Tracking and visibility ONLY -- no money moves as a result of this
-- migration. Billing execution (netting the subscription off payouts) is
-- a later stage, deliberately not built until these numbers have been
-- verified by hand for a full cycle.
--
-- Pricing model being tracked:
--   * monthly subscription = 3 x the operator's own unweighted average
--     nightly rate, snapshotted when billing begins
--   * operators pay nothing until Fichua has delivered 10 paid bookings
--   * a cancelled or refunded booking does NOT count toward the ten
--
-- Note on "paid": payments aren't integrated yet, so there is no 'paid'
-- booking status. 'confirmed' is the state a booking reaches once it is
-- accepted, and is what the payment webhook will set when Flutterwave/
-- IremboPay goes live. The counter below therefore counts 'confirmed'
-- and will keep working unchanged once real payments land. 'refunded' is
-- added to the allowed statuses now so the decrement rule works from day
-- one rather than needing a second migration later.

-- ---------------------------------------------------------------
-- 1. Allow 'refunded' as a booking status
-- ---------------------------------------------------------------
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded'));

-- A refunded booking must not hold a room either -- same treatment as
-- cancelled in the no-overlap constraint.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (room_type_id WITH =, stay_range WITH &&)
  WHERE (status NOT IN ('cancelled', 'refunded'));

-- ---------------------------------------------------------------
-- 2. Lifecycle + subscription columns on operators
-- ---------------------------------------------------------------
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

-- ---------------------------------------------------------------
-- 3. Delivered-booking counter (auditable)
-- ---------------------------------------------------------------
-- Counts bookings that are paid and have stayed paid. Cancelled and
-- refunded bookings are excluded, so a booking that never really
-- happened can never push an operator into billing.
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

-- The individual bookings behind the number, so a disputed count can be
-- settled in seconds rather than by digging through records.
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
  -- SECURITY DEFINER + guest names and booking values: admin only.
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

-- ---------------------------------------------------------------
-- 4. Subscription price calculation
-- ---------------------------------------------------------------
-- Unweighted average of the operator's active room-type nightly rates,
-- multiplied by three. Unweighted (not occupancy- or revenue-weighted)
-- because an operator has to be able to reproduce the number by hand --
-- a price they can't verify is a price they won't trust.
--
-- Returns NULL when the operator has no room types, so callers must
-- handle that rather than silently billing zero.
CREATE OR REPLACE FUNCTION public.calculate_subscription_price(p_operator_id UUID)
RETURNS TABLE (price NUMERIC, currency TEXT, room_type_count INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROUND(AVG(rt.price_per_night) * 3, 2) AS price,
    -- Currencies should be uniform per operator; MIN() picks
    -- deterministically if they somehow differ, and the admin UI surfaces
    -- the room count so a mixed-currency operator is visible.
    MIN(rt.currency) AS currency,
    COUNT(*)::int AS room_type_count
  FROM public.room_types rt
  WHERE rt.operator_id = p_operator_id
  HAVING COUNT(*) > 0;
$$;

-- ---------------------------------------------------------------
-- 5. Lifecycle stage evaluation
-- ---------------------------------------------------------------
-- Derives the correct stage from data that already exists, so stages can
-- never drift out of sync with reality. Deliberately does NOT override
-- 'paused', which is a manual admin decision, not a derived state.
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

  -- 'paused' is set by a human and must not be auto-reverted.
  IF op.lifecycle_stage = 'paused' THEN
    RETURN 'paused';
  END IF;

  v_count := public.delivered_booking_count(p_operator_id);

  SELECT MAX(created_at) INTO v_last_booking
  FROM public.bookings
  WHERE operator_id = p_operator_id AND status = 'confirmed';

  IF op.status <> 'published' THEN
    -- Not live yet: lead -> verifying -> ready
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

  -- Crossing into billing: snapshot the price once and never recompute
  -- it automatically, so an operator's bill doesn't move when they adjust
  -- their seasonal rates.
  IF v_new_stage = 'live_subscribed' AND op.billing_started_at IS NULL THEN
    SELECT * INTO v_price FROM public.calculate_subscription_price(p_operator_id);
    -- Only start billing if a price can actually be computed. An operator
    -- with no room types has no average nightly rate, so there is no
    -- defensible amount to charge -- leave billing_started_at NULL and let
    -- them surface on the dashboard as needing attention rather than
    -- silently entering billing at zero/NULL.
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

-- Re-evaluate the affected operator whenever a booking changes state.
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

-- Same when verification flags or publish status change.
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

-- ---------------------------------------------------------------
-- 6. Admin dashboard feed
-- ---------------------------------------------------------------
-- One row per operator with everything the lifecycle dashboard needs,
-- including the live-computed price for operators not yet snapshotted so
-- you can see what someone WILL pay before they get there.
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- ---------------------------------------------------------------
-- 7. Permissions
-- ---------------------------------------------------------------
-- All of these are admin-only back-office functions. They are
-- SECURITY DEFINER (they read across operators and bookings), so EXECUTE
-- is revoked from anon entirely and each function re-checks the caller's
-- admin role where it returns cross-operator data.
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

-- ---------------------------------------------------------------
-- 8. Backfill existing operators
-- ---------------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.operators LOOP
    PERFORM public.evaluate_operator_lifecycle(r.id);
  END LOOP;
END $$;
