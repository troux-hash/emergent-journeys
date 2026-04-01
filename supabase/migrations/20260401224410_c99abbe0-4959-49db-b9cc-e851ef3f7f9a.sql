
-- Add columns for two-way chat
ALTER TABLE public.chat_messages
ADD COLUMN session_id text NOT NULL DEFAULT gen_random_uuid()::text,
ADD COLUMN sender_type text NOT NULL DEFAULT 'visitor';

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Allow visitors to read messages from their own session
CREATE POLICY "Visitors can read their session messages"
ON public.chat_messages
FOR SELECT
TO public
USING (true);

-- Drop the old service-role-only select policy since visitors need to read too
DROP POLICY IF EXISTS "Service role can read chat messages" ON public.chat_messages;
