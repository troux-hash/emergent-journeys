-- Completes the round trip for email-originated chat threads: whenever an
-- admin or the AI agent inserts a reply into chat_messages for a session
-- that started as an inbound email, this fires that reply back out as a
-- real email via the existing send-transactional-email function (which
-- already handles rendering, suppression checks, and delivery through
-- Lovable's managed email service).
--
-- Deliberately does NOT check NEW.channel on the reply row itself -- admin
-- replies (via /admin/chat) and agent replies (via chat-agent-reply) never
-- set a channel, so they'd default to 'web'. Instead this looks back
-- through the session's own history for an earlier 'email' message with a
-- visitor_email set, which only the inbound-email function ever creates.
-- That makes this trigger correct with zero changes needed to the admin
-- reply UI or the agent function -- both already "just work" once this
-- ships.

CREATE OR REPLACE FUNCTION public.notify_email_channel_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fn_base_url text;
  svc_key text;
  v_email text;
BEGIN
  IF NEW.sender_type NOT IN ('agent', 'admin') THEN
    RETURN NEW;
  END IF;

  SELECT visitor_email INTO v_email
  FROM public.chat_messages
  WHERE session_id = NEW.session_id
    AND channel = 'email'
    AND visitor_email IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1;

  -- Not an email-originated thread (e.g. ordinary site chat) -- nothing to do.
  IF v_email IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO fn_base_url FROM vault.decrypted_secrets WHERE name = 'project_functions_base_url' LIMIT 1;
  SELECT decrypted_secret INTO svc_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;

  IF fn_base_url IS NULL OR svc_key IS NULL THEN
    RAISE NOTICE 'notify_email_channel_reply: waiting on Vault secret(s) -- skipping this reply';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(fn_base_url, '/') || '/send-transactional-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || svc_key
    ),
    body := jsonb_build_object(
      'templateName', 'chat-reply',
      'recipientEmail', v_email,
      'idempotencyKey', 'chat-reply-' || NEW.id,
      'templateData', jsonb_build_object('message', NEW.message)
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_email_channel_reply ON public.chat_messages;
CREATE TRIGGER trg_notify_email_channel_reply
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_email_channel_reply();
