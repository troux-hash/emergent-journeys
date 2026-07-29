-- Close the second wave of incomplete revokes: these admin-only SECURITY DEFINER
-- functions had only `REVOKE ... FROM PUBLIC` in their original migrations,
-- which leaves Supabase's default EXECUTE grant to `authenticated` intact.
-- All 12 already gate output on has_role(auth.uid(),'admin'), so this is
-- defense-in-depth, not a fix for an exploitable bug -- but it brings the
-- production state in line with the allowlist assertion the test suite now
-- enforces.

REVOKE EXECUTE ON FUNCTION public.calculate_subscription_price(uuid)          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delivered_booking_count(uuid)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delivered_bookings_detail(uuid)             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enquiry_queue()                             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.evaluate_operator_lifecycle(uuid)           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_baseline_queries(uuid)             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_system_alert(text, text, jsonb)         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.open_system_alerts()                        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.operator_lifecycle_overview()               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_readiness(uuid)                     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.run_enquiry_escalation()                    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_baseline_tests(uuid)                   FROM PUBLIC, anon, authenticated;