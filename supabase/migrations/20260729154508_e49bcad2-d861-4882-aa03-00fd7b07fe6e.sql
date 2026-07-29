-- 1) Drop chat_messages from realtime publication (regression: was fixed 2026-07-26, then re-added same day)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='chat_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages';
  END IF;
END $$;

-- 2) Event trigger guard: prevents chat_messages from being re-added to supabase_realtime
CREATE OR REPLACE FUNCTION public.guard_chat_messages_not_in_realtime()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='chat_messages'
  ) THEN
    RAISE EXCEPTION 'chat_messages must NOT be added to supabase_realtime publication. See leak fixed 2026-07-26 and re-broken same day. Admin view polls instead. If realtime is truly needed, first design per-session authorization.';
  END IF;
END;
$$;

DROP EVENT TRIGGER IF EXISTS guard_chat_messages_realtime;
CREATE EVENT TRIGGER guard_chat_messages_realtime
  ON ddl_command_end
  WHEN TAG IN ('ALTER PUBLICATION')
  EXECUTE FUNCTION public.guard_chat_messages_not_in_realtime();