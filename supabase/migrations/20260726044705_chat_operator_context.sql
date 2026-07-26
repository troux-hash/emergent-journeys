-- Lets a chat conversation be tied to a specific property (vs. the
-- generic homepage funnel chat, where this stays null). The chat-agent-reply
-- function uses this to ground its answers in that operator's real
-- rooms/pricing/amenities instead of only generic Fichua FAQ text.

ALTER TABLE public.chat_messages
  ADD COLUMN operator_id UUID REFERENCES public.operators(id) ON DELETE SET NULL;

CREATE INDEX idx_chat_messages_operator_id ON public.chat_messages (operator_id);
