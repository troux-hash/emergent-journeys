DROP EVENT TRIGGER IF EXISTS guard_chat_messages_realtime;

CREATE OR REPLACE FUNCTION public.guard_chat_messages_not_in_realtime()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  n integer;
BEGIN
  -- Check resulting state, not command text. Robust to:
  --   ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  --   DROP PUBLICATION + CREATE PUBLICATION ... FOR TABLE public.chat_messages;
  --   CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  SELECT count(*) INTO n
  FROM pg_publication_tables
  WHERE pubname    = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename  = 'chat_messages';

  IF n > 0 THEN
    RAISE EXCEPTION 'chat_messages must not be in supabase_realtime (26 July incident: visitor session isolation depends on this staying out of the realtime publication)';
  END IF;
END;
$$;

CREATE EVENT TRIGGER guard_chat_messages_realtime
  ON ddl_command_end
  WHEN TAG IN ('ALTER PUBLICATION', 'CREATE PUBLICATION')
  EXECUTE FUNCTION public.guard_chat_messages_not_in_realtime();

COMMENT ON EVENT TRIGGER guard_chat_messages_realtime IS
  'Blocks chat_messages from re-entering supabase_realtime via ALTER or DROP+CREATE. Checks pg_publication_tables state, not command text.';