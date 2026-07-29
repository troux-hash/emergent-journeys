-- Replace guard with state-based check, covering both ALTER and CREATE PUBLICATION.
DROP EVENT TRIGGER IF EXISTS guard_chat_messages_realtime;

CREATE OR REPLACE FUNCTION public.guard_chat_messages_not_in_realtime()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename  = 'chat_messages';

  IF n > 0 THEN
    RAISE EXCEPTION
      'chat_messages must not be in supabase_realtime publication (26 July 2026 incident). '
      'Admin view polls instead. If realtime is truly needed, first design per-session authorization.';
  END IF;
END;
$$;

CREATE EVENT TRIGGER guard_chat_messages_realtime
ON ddl_command_end
WHEN TAG IN ('ALTER PUBLICATION', 'CREATE PUBLICATION')
EXECUTE FUNCTION public.guard_chat_messages_not_in_realtime();