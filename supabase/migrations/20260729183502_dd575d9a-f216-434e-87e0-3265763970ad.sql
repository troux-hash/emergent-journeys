-- 1. Revoke leaked EXECUTE on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.expire_stale_pending_bookings()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_booking_lifecycle_refresh()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_operator_lifecycle_refresh()      FROM PUBLIC, anon, authenticated;

-- 2. operator_responsiveness: null metrics when not publishable
CREATE OR REPLACE FUNCTION public.operator_responsiveness(p_operator_id uuid)
RETURNS TABLE(answered_count integer, total_count integer,
              median_minutes numeric, answered_within_hour_pct numeric,
              is_publishable boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  WITH e AS (
    SELECT responded_at, created_at,
           EXTRACT(EPOCH FROM (responded_at - created_at)) / 60 AS mins
    FROM public.enquiries
    WHERE operator_id = p_operator_id AND outcome <> 'spam'
  ),
  agg AS (
    SELECT
      COUNT(*) FILTER (WHERE responded_at IS NOT NULL)::int AS answered,
      COUNT(*)::int AS total,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY mins)
            FILTER (WHERE mins IS NOT NULL)::numeric, 1) AS median_min,
      CASE WHEN COUNT(*) FILTER (WHERE responded_at IS NOT NULL) > 0
        THEN ROUND(100.0 * COUNT(*) FILTER (WHERE mins <= 60)
                   / COUNT(*) FILTER (WHERE responded_at IS NOT NULL), 0)
        ELSE NULL END AS within_hour_pct
    FROM e
  )
  SELECT
    CASE WHEN answered >= 5 THEN answered        ELSE NULL END,
    CASE WHEN answered >= 5 THEN total           ELSE NULL END,
    CASE WHEN answered >= 5 THEN median_min      ELSE NULL END,
    CASE WHEN answered >= 5 THEN within_hour_pct ELSE NULL END,
    (answered >= 5)
  FROM agg;
$function$;