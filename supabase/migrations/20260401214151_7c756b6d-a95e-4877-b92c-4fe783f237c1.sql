
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name TEXT NOT NULL DEFAULT 'Visitor',
  visitor_email TEXT,
  message TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can send a chat message
CREATE POLICY "Anyone can insert chat messages"
ON public.chat_messages
FOR INSERT
TO public
WITH CHECK (true);

-- Only service role can read messages
CREATE POLICY "Service role can read chat messages"
ON public.chat_messages
FOR SELECT
USING (auth.role() = 'service_role'::text);

-- Only service role can update (mark as read)
CREATE POLICY "Service role can update chat messages"
ON public.chat_messages
FOR UPDATE
USING (auth.role() = 'service_role'::text);
