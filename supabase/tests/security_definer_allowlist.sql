-- ---------------------------------------------------------------
-- Admin UI reachability assertion.
-- ---------------------------------------------------------------
-- The over-exposure allowlists catch functions granted too widely. This
-- catches the opposite failure, which turned out to be just as damaging:
-- 20260729184156 revoked authenticated EXECUTE from every admin-only
-- SECURITY DEFINER function in response to a scanner finding, which silently
-- broke /intranet/lifecycle, /intranet/operators and /intranet/enquiries in
-- production. A browser is never service_role.
--
-- For an admin function reached from a browser the correct shape is a grant
-- to authenticated PLUS an in-body has_role guard. The guard is the access
-- control; the grant only lets the request arrive. Removing the grant hardens
-- nothing and makes the feature unreachable.
DO $$
DECLARE
  required TEXT[] := ARRAY[
    'enquiry_queue',                -- IntranetEnquiries
    'run_enquiry_escalation',       -- IntranetEnquiries
    'operator_lifecycle_overview',  -- IntranetLifecycle
    'delivered_bookings_detail',    -- IntranetLifecycle
    'open_system_alerts',           -- IntranetLifecycle
    'publish_readiness',            -- IntranetOperators
    'seed_baseline_tests',          -- IntranetOperators
    'has_role'                      -- useAdminAuth, and RLS policies
  ];
  broken TEXT[];
BEGIN
  SELECT coalesce(array_agg(r), ARRAY[]::TEXT[]) INTO broken
    FROM unnest(required) r
   WHERE NOT EXISTS (
     SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = r
        AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
   );

  IF array_length(broken, 1) IS NOT NULL THEN
    RAISE EXCEPTION E'admin UI can no longer call: %\n'
      '  These are invoked from the intranet by a signed-in admin over the\n'
      '  browser, i.e. as `authenticated`. Without the grant the request\n'
      '  cannot arrive at all and the page fails. The in-body\n'
      '  has_role(auth.uid(), ''admin'') guard is what provides security --\n'
      '  revoking the grant hardens nothing and breaks the feature.', broken;
  END IF;

  RAISE NOTICE 'admin UI function reachability OK (% function(s))', array_length(required, 1);
END $$;
