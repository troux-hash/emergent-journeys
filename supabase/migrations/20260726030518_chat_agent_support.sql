-- Support an AI agent replying in chat_messages, and fix two regressions from
-- the previous security-hardening migration (20260726022413):
--   1) Admin replies were silently rejected (INSERT policy required
--      sender_type = 'visitor' for every anon/authenticated insert).
--   2) Visitors could no longer read anything back — the broad "read own
--      session" SELECT policy was removed (correctly, it wasn't actually
--      scoped to the session and leaked every conversation), and the table
--      was pulled out of the realtime publication entirely, breaking the
--      admin panel's live updates too.

-- Restore realtime delivery. This is safe to re-add: Realtime Postgres
-- Changes are gated by each subscriber's own SELECT RLS, and the only
-- SELECT policy on this table is "Admins can read chat messages" — anon
-- visitors still have no table-level SELECT access, so they receive nothing.
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Allow admins (and the service-role-driven AI agent, for completeness) to
-- insert replies. The existing "Anyone can insert chat messages" policy is
-- untouched and still only allows sender_type = 'visitor'.
CREATE POLICY "Admins can insert chat replies"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type IN ('admin', 'agent')
    AND public.has_role(auth.uid(), 'admin')
    AND length(btrim(message)) BETWEEN 1 AND 4000
  );

-- Let a visitor's browser fetch only their own session's messages, without
-- granting broad table SELECT. session_id is a random UUID generated
-- client-side (effectively unguessable), so scoping by exact match here is
-- the security boundary — this replaces relying on RLS + a client-side
-- .eq() filter, which is what caused the original leak.
CREATE OR REPLACE FUNCTION public.get_chat_session_messages(p_session_id text)
RETURNS TABLE (
  id uuid,
  message text,
  sender_type text,
  created_at timestamptz,
  visitor_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT cm.id, cm.message, cm.sender_type, cm.created_at, cm.visitor_name
  FROM public.chat_messages cm
  WHERE cm.session_id = p_session_id
    AND length(p_session_id) BETWEEN 1 AND 200
  ORDER BY cm.created_at ASC
  LIMIT 200;
$$;

REVOKE ALL ON FUNCTION public.get_chat_session_messages(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_chat_session_messages(text) TO anon, authenticated;

-- Helpful for the agent function's per-session history lookups and the
-- new RPC above.
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON public.chat_messages (session_id, created_at);
