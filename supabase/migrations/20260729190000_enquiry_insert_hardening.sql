-- Close a hole the RLS suite found in my own enquiries migration.
--
-- WHAT WAS WRONG
-- Two related defects, both invisible until the policies were actually
-- exercised as the anon role:
--
-- 1. generate_enquiry_reference() reads public.enquiries to check
--    uniqueness, but was not SECURITY DEFINER. anon holds INSERT and not
--    SELECT, so any insert relying on the column DEFAULT failed with
--    "permission denied for table enquiries". The anon INSERT policy was
--    therefore dead code -- it could never be exercised as written.
--
-- 2. Worse: an anon caller who SUPPLIED their own reference skipped the
--    DEFAULT entirely and the insert succeeded. That bypassed
--    create_enquiry(), which is the only place the "operator must be
--    published" check lives. So anyone could create enquiries against
--    draft or paused operators -- and because unanswered enquiries
--    trigger nudges, that is an unauthenticated way to make Fichua send
--    email and WhatsApp messages to operators on demand.
--
-- HOW IT IS FIXED
-- The RPC becomes the only way in. anon's direct INSERT grant is revoked,
-- so there is one code path with one set of checks instead of two paths
-- where the looser one wins. The reference generator gets SECURITY
-- DEFINER so it works when called through the RPC chain.
--
-- This is the lesson from the test, stated plainly: a table-level GRANT
-- plus a permissive policy silently created a second, weaker entrance to
-- a function I had carefully guarded.

-- 1. The generator needs to read the table it de-duplicates against.
CREATE OR REPLACE FUNCTION public.generate_enquiry_reference()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I/O/0/1, avoids misreads
  candidate TEXT;
  i INT;
BEGIN
  LOOP
    candidate := 'FCH-';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.enquiries WHERE reference = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_enquiry_reference() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_enquiry_reference() TO service_role;

-- 2. One entrance only. create_enquiry() is SECURITY DEFINER and checks
--    that the operator is published; a direct table insert did not.
DROP POLICY IF EXISTS "Anyone can create an enquiry" ON public.enquiries;
REVOKE INSERT ON public.enquiries FROM anon;

-- Belt and braces: if a future migration re-grants INSERT, the policy that
-- comes back should still refuse unpublished operators rather than
-- silently reopening the bypass.
CREATE POLICY "Enquiries for published operators only"
  ON public.enquiries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.operators o
       WHERE o.id = enquiries.operator_id AND o.status = 'published'
    )
    AND channel IN ('whatsapp', 'email', 'chat', 'phone')
    AND (traveller_name IS NULL OR char_length(traveller_name) <= 200)
    AND (traveller_contact IS NULL OR char_length(traveller_contact) <= 320)
    AND (initial_message IS NULL OR char_length(initial_message) <= 2000)
    AND responded_at IS NULL
    AND outcome = 'open'
  );

COMMENT ON FUNCTION public.create_enquiry(UUID, TEXT, TEXT) IS
  'The only supported way to create an enquiry. Direct inserts are revoked for anon deliberately: the published-operator check lives here, and a second entrance would be a weaker one.';
