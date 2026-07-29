-- Expire abandoned pending bookings so they cannot squat a room's calendar.
-- Cancellation flips status to 'cancelled', which the bookings_no_overlap
-- exclusion constraint already excludes, freeing the dates immediately.
CREATE OR REPLACE FUNCTION public.expire_stale_pending_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  WITH expired AS (
    UPDATE public.bookings
       SET status = 'cancelled',
           updated_at = now()
     WHERE status = 'pending'
       AND created_at < now() - interval '30 minutes'
     RETURNING id
  )
  SELECT count(*) INTO v_count FROM expired;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_pending_bookings() FROM PUBLIC;
-- Cron runs as the job owner; no anon/authenticated grant.

COMMENT ON FUNCTION public.expire_stale_pending_bookings() IS
  'TTL sweep: cancels pending bookings older than 30 minutes so unpaid holds cannot lock a room''s calendar. Called by pg_cron every 5 minutes.';

-- (Re)schedule the sweep. Unschedule any prior copy so re-running is idempotent.
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
  '*/5 * * * *',
  $$SELECT public.expire_stale_pending_bookings();$$
);