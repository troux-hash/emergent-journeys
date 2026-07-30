-- ---------------------------------------------------------------
-- SECURITY DEFINER exposure assertions. THREE blocks, all required.
-- ---------------------------------------------------------------
-- Blocks 1 and 2 catch OVER-exposure (a function reachable by a role that
-- should not reach it). Block 3 catches UNDER-exposure (a grant revoked so
-- far that a real feature stops working). Both failure modes have happened
-- in production; either block alone is a false sense of safety.
--
-- These only mean anything if bootstrap.sql reproduces Supabase's default
-- `GRANT EXECUTE ... TO anon, authenticated` on new functions. Without that
-- line a migration writing only `REVOKE ... FROM PUBLIC` looks clean locally
-- while staying wide open in production.

-- ---------------------------------------------------------------
-- 1. anon EXECUTE allowlist
-- ---------------------------------------------------------------
-- Reached from the public site with no sign-in: booking, enquiry, review and
-- chat entry points. Each does its own validation in-body.
DO $$
DECLARE
  allowed TEXT[] := ARRAY[
    'acknowledge_enquiry',
    'create_booking',
    'create_enquiry',
    'get_booking_for_review',
    'get_chat_session_messages',
    'operator_responsiveness',
    'submit_verified_review'
  ];
  extra TEXT[];
BEGIN
  SELECT coalesce(array_agg(DISTINCT p.proname ORDER BY p.proname), ARRAY[]::TEXT[])
    INTO extra
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prosecdef
     AND has_function_privilege('anon', p.oid, 'EXECUTE')
     AND NOT (p.proname = ANY(allowed));

  IF array_length(extra, 1) IS NOT NULL THEN
    RAISE EXCEPTION E'anon can EXECUTE non-allowlisted SECURITY DEFINER function(s): %\n'
      '  A SECURITY DEFINER function runs with the owner''s rights, so an anon\n'
      '  grant is a public API. Either add an in-body guard and add it to this\n'
      '  allowlist deliberately, or REVOKE EXECUTE FROM PUBLIC, anon.\n'
      '  Note: REVOKE FROM PUBLIC alone is NOT enough -- Supabase default\n'
      '  privileges grant EXECUTE to anon/authenticated directly.', extra;
  END IF;

  RAISE NOTICE 'anon SECURITY DEFINER allowlist OK (% allowed)', array_length(allowed, 1);
END $$;

-- ---------------------------------------------------------------
-- 2. authenticated EXECUTE allowlist
-- ---------------------------------------------------------------
-- Everything anon may call, plus the admin-UI functions, each of which
-- carries an in-body has_role(auth.uid(), 'admin') guard.
DO $$
DECLARE
  allowed TEXT[] := ARRAY[
    -- public entry points (also reachable signed-in)
    'acknowledge_enquiry',
    'create_booking',
    'create_enquiry',
    'get_booking_for_review',
    'get_chat_session_messages',
    'operator_responsiveness',
    'submit_verified_review',
    -- admin UI: grant lets the request arrive, in-body guard is the control
    'delivered_bookings_detail',
    'enquiry_queue',
    'has_role',
    'open_system_alerts',
    'operator_lifecycle_overview',
    'publish_readiness',
    'run_enquiry_escalation',
    'seed_baseline_tests'
  ];
  extra TEXT[];
BEGIN
  SELECT coalesce(array_agg(DISTINCT p.proname ORDER BY p.proname), ARRAY[]::TEXT[])
    INTO extra
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prosecdef
     AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT (p.proname = ANY(allowed));

  IF array_length(extra, 1) IS NOT NULL THEN
    RAISE EXCEPTION E'authenticated can EXECUTE non-allowlisted SECURITY DEFINER function(s): %\n'
      '  Any signed-in user -- not just an admin -- can call these. If the\n'
      '  function is admin-only it needs an in-body has_role guard AND a\n'
      '  deliberate entry here; if nothing in src/ calls it, revoke instead:\n'
      '  REVOKE EXECUTE ON FUNCTION public.<fn>(<args>) FROM PUBLIC, anon, authenticated;', extra;
  END IF;

  RAISE NOTICE 'authenticated SECURITY DEFINER allowlist OK (% allowed)', array_length(allowed, 1);
END $$;

-- ---------------------------------------------------------------
-- 3. Admin UI reachability assertion.
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
