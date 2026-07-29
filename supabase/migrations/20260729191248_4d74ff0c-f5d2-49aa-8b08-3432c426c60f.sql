-- URGENT: restore browser reachability for guarded admin UI RPCs.
-- Access control remains inside each SECURITY DEFINER function via
-- public.has_role(auth.uid(), 'admin'); this grant only allows signed-in
-- browser requests to reach that in-body guard.

GRANT EXECUTE ON FUNCTION public.enquiry_queue() TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_enquiry_escalation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.operator_lifecycle_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delivered_bookings_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.open_system_alerts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_readiness(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_baseline_tests(uuid) TO authenticated;

-- Intentionally not restored:
-- - calculate_subscription_price(uuid)
-- - delivered_booking_count(uuid)
-- - evaluate_operator_lifecycle(uuid)
-- - log_system_alert(text, text, jsonb)
-- - generate_baseline_queries(uuid)
-- - escalate_unanswered_enquiries(integer, integer)
-- - expire_stale_pending_bookings()