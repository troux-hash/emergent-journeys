
-- 1. Restrict profiles SELECT to owner only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Support requests: validate insert instead of WITH CHECK (true)
DROP POLICY IF EXISTS "Anyone can file a support request" ON public.support_requests;
CREATE POLICY "Anyone can file a support request"
  ON public.support_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    message IS NOT NULL
    AND char_length(btrim(message)) BETWEEN 1 AND 5000
    AND (reporter_contact IS NULL OR char_length(reporter_contact) <= 320)
    AND (reporter_name IS NULL OR char_length(reporter_name) <= 200)
  );

-- 3. Revoke EXECUTE on SECURITY DEFINER helpers not called from the client.
--    Edge functions use the service_role and are unaffected.
REVOKE EXECUTE ON FUNCTION public.check_room_availability(uuid, date, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_email_channel_reply() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_pending_review_requests() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
