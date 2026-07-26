-- 1) Profiles: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2) Chat messages: restrict SELECT to admins/service_role only (removes public read + realtime leak)
DROP POLICY IF EXISTS "Visitors can read their session messages" ON public.chat_messages;
CREATE POLICY "Admins can read chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Tighten anonymous INSERT policy on chat_messages (remove WITH CHECK true)
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;
CREATE POLICY "Anyone can insert chat messages"
  ON public.chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    sender_type = 'visitor'
    AND length(btrim(message)) BETWEEN 1 AND 4000
    AND length(session_id) BETWEEN 1 AND 200
    AND (visitor_email IS NULL OR visitor_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  );

-- 3) Operator leads: replace WITH CHECK (true) with light validation
DROP POLICY IF EXISTS "Anyone can submit an operator lead" ON public.operator_leads;
CREATE POLICY "Anyone can submit an operator lead"
  ON public.operator_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 100
    AND length(btrim(property_name)) BETWEEN 1 AND 150
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone IS NULL OR length(phone) <= 40)
    AND status = 'new'
  );

-- 4) Remove chat_messages from realtime publication (was broadcasting all rows)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages';
  END IF;
END $$;

-- 5) Lock down SECURITY DEFINER functions: revoke EXECUTE from public/anon/authenticated
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

-- has_role is used inside RLS policies evaluated for signed-in users, so keep EXECUTE for authenticated
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;