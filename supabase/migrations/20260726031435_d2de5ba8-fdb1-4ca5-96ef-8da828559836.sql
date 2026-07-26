ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

CREATE POLICY "Admins can insert chat replies"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type IN ('admin', 'agent')
    AND public.has_role(auth.uid(), 'admin')
    AND length(btrim(message)) BETWEEN 1 AND 4000
  );

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

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON public.chat_messages (session_id, created_at);