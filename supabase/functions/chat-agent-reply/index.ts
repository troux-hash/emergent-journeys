import { createClient } from 'npm:@supabase/supabase-js@2'

// AI first-responder for the marketing site chat widget.
//
// Flow: ChatWidget inserts a visitor message, then fire-and-forget invokes
// this function with the session_id. This function re-reads the full
// session history from the database (never trusts client-supplied message
// content), decides whether a human has already taken over, and if not,
// asks Claude for a short reply and inserts it as sender_type = 'agent'.
//
// Human handoff rule: if ANY message in the session has sender_type =
// 'admin', the agent stays silent for the rest of that session — a human
// has taken over and the agent should not talk over them.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'
const MAX_HISTORY_MESSAGES = 20

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  zh: 'Chinese',
  rw: 'Kinyarwanda',
}

const SYSTEM_PROMPT = `You are the Fichua chat assistant, replying on the Fichua marketing website to independent tourism operators (lodges, camps, small hotels, tour operators) who are considering signing up.

What Fichua does: gives independent operators their own page so they get found by travelers and AI/Google search, take bookings directly (no OTA middleman), and keep their revenue. No upfront fees, no long contracts.

Your job:
- Answer questions about what Fichua does and how it works, warmly and concisely (2-4 short sentences, plain language, no corporate jargon).
- Do NOT invent or confirm specific prices, exact onboarding timelines, or contract terms — the site does not publish exact pricing. If asked for exact numbers or commitments, say a team member will confirm the details with them directly.
- Actively but gently steer operators toward filling in the sign-up form on the page (name of entity, WhatsApp number, socials, rooms, price range) or sharing their WhatsApp number here, so the team can follow up within 24 hours.
- Never claim to be a human. If asked, say you're the Fichua assistant, and a team member can join the conversation.
- Reply in {LANGUAGE}, matching the visitor.
- Keep replies short — this is a chat widget, not an essay.`

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface ChatRow {
  id: string
  message: string
  sender_type: string
  created_at: string
  visitor_name: string
  language?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

  if (!supabaseUrl || !supabaseServiceKey || !anthropicKey) {
    console.error('Missing required environment variables', {
      has_supabase_url: !!supabaseUrl,
      has_service_key: !!supabaseServiceKey,
      has_anthropic_key: !!anthropicKey,
    })
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  let sessionId: string
  try {
    const body = await req.json()
    sessionId = String(body.session_id ?? '')
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  if (!sessionId || sessionId.length > 200) {
    return jsonResponse({ error: 'Missing or invalid session_id' }, 400)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: history, error: historyError } = await supabase
    .from('chat_messages')
    .select('id, message, sender_type, created_at, visitor_name, language')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (historyError) {
    console.error('Failed to load session history', { error: historyError })
    return jsonResponse({ error: 'Failed to load history' }, 500 )
  }

  const messages = (history ?? []) as ChatRow[]

  if (messages.length === 0) {
    return jsonResponse({ skipped: true, reason: 'no_messages' })
  }

  // Human has taken over this session — stay silent for the rest of it.
  if (messages.some((m) => m.sender_type === 'admin')) {
    return jsonResponse({ skipped: true, reason: 'human_takeover' })
  }

  const lastMessage = messages[messages.length - 1]

  // Someone (agent or admin) already responded to the latest visitor
  // message, or the latest message isn't from a visitor at all — nothing
  // to do. Prevents duplicate replies from overlapping invocations.
  if (lastMessage.sender_type !== 'visitor') {
    return jsonResponse({ skipped: true, reason: 'already_responded' })
  }

  const visitorName = lastMessage.visitor_name || 'there'
  const languageCode = lastMessage.language || 'en'
  const languageName = LANGUAGE_NAMES[languageCode] || 'English'

  const recentHistory = messages.slice(-MAX_HISTORY_MESSAGES)
  const anthropicMessages = recentHistory.map((m) => ({
    role: m.sender_type === 'visitor' ? 'user' : 'assistant',
    content: m.message,
  }))

  let replyText: string
  try {
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT.replace('{LANGUAGE}', languageName),
        messages: anthropicMessages,
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('Anthropic API error', {
        status: aiResponse.status,
        body: errText.slice(0, 500),
      })
      return jsonResponse({ error: 'AI request failed' }, 502)
    }

    const aiData = await aiResponse.json()
    replyText = (aiData.content ?? [])
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { text: string }) => block.text)
      .join('\n')
      .trim()

    if (!replyText) {
      console.error('Anthropic returned no text content', { aiData })
      return jsonResponse({ error: 'Empty AI response' }, 502)
    }
  } catch (error) {
    console.error('Failed to call Anthropic API', { error: String(error) })
    return jsonResponse({ error: 'AI request failed' }, 502)
  }

  const { error: insertError } = await supabase.from('chat_messages').insert({
    visitor_name: 'Fichua Assistant',
    message: replyText,
    session_id: sessionId,
    sender_type: 'agent',
    language: languageCode,
  })

  if (insertError) {
    console.error('Failed to insert agent reply', { error: insertError })
    return jsonResponse({ error: 'Failed to save reply' }, 500)
  }

  console.log('Agent replied', {
    session_id: sessionId,
    visitor_name: visitorName,
    language: languageCode,
    reply_length: replyText.length,
  })

  return jsonResponse({ success: true })
})
