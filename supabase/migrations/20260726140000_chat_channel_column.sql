-- Prepares chat_messages to carry threads from more than just the website
-- widget. Every message so far has implicitly been 'web'; this makes that
-- explicit so future channels (inbound email, WhatsApp) can be told apart,
-- and so an outbound reply can eventually be routed back out over the
-- right channel (a web session has nowhere to "reply" to; an email or
-- WhatsApp session does).

ALTER TABLE public.chat_messages
  ADD COLUMN channel TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'email', 'whatsapp'));

CREATE INDEX idx_chat_messages_channel ON public.chat_messages (channel);
