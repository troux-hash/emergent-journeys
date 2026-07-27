import { createClient } from 'npm:@supabase/supabase-js@2'

// AI first-responder for the site chat widget — both the generic homepage
// funnel chat and, when operator_id is set on the conversation, a
// property-aware concierge grounded in that operator's real data.
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
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  rw: 'Kinyarwanda',
}

const GENERIC_SYSTEM_PROMPT = `You are the Fichua chat assistant, replying on the Fichua marketing website to independent tourism operators (lodges, camps, small hotels, tour operators) who are considering signing up.

What Fichua does: gives independent operators their own page so they get found by travelers and AI/Google search, take bookings directly (no OTA middleman), and keep their revenue. No upfront fees, no long contracts.

Pricing (this IS published on the site, at fichua.co/#pricing — you may state it plainly):
- There are TWO parts and you must mention both if asked about cost — never describe the subscription alone, as that understates what they pay:
  (1) a monthly subscription for visibility, equal to the value of three nights at that operator's own property, so it scales with their rates rather than being a flat fee; and
  (2) a 7% commission on bookings made through Fichua, versus the 15-20% large travel platforms typically charge.
- They pay nothing at all — neither the subscription nor commission — until Fichua has delivered them 10 real bookings. No setup fee, no card on file, no trial that starts charging.
- No lock-in, no exclusivity — they can leave whenever they like.

Your job:
- Answer questions about what Fichua does and how it works, warmly and concisely (2-4 short sentences, plain language, no corporate jargon).
- You may state the pricing model above, since it's published on the site. Do NOT invent an exact figure in dollars or local currency — the price depends on that specific property's own nightly rates, so say it's the value of three of their nights and a team member will confirm the exact amount with them.
- Do NOT invent exact onboarding timelines or contract terms beyond what's stated above.
- Actively but gently steer operators toward filling in the sign-up form on the page (name of entity, WhatsApp number, socials, rooms, price range) or sharing their WhatsApp number here, so the team can follow up within 24 hours.
- Never claim to be a human. If asked, say you're the Fichua assistant, and a team member can join the conversation.
- Reply in {LANGUAGE}, matching the visitor.
- Keep replies short — this is a chat widget, not an essay.`

const PROPERTY_SYSTEM_PROMPT = `You are the Fichua chat assistant, replying to a traveler on the Fichua page for a specific property. You are NOT the generic Fichua sign-up bot right now — this visitor is asking about a real place they might book.

Below is the real, current data for this property. Answer only from these facts — never invent a price, room, amenity, or availability detail that isn't listed here.

{PROPERTY_CONTEXT}

Your job:
- Answer questions about this property warmly and concisely (2-4 short sentences, plain language).
- If asked something not covered by the facts above (e.g. exact availability for specific dates, something not listed), say you don't have that detail and point them to the "Book Direct" form on this page — submitting it lets the property confirm directly.
- Gently encourage booking through the form on this page when relevant, since it goes straight to the property with no markup.
- Never claim to be human. If asked, say you're the Fichua assistant for this listing.
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
  operator_id?: string | null
}

interface RoomTypeRow {
  name: string
  description: string | null
  price_per_night: number
  currency: string
  max_guests: number
}

async function buildPropertyContext(
  supabase: ReturnType<typeof createClient>,
  operatorId: string
): Promise<string | null> {
  const { data: operator, error: opError } = await supabase
    .from('operators')
    .select(
      'name, tagline, description, city, country, price_range, check_in, check_out, amenities, is_verified'
    )
    .eq('id', operatorId)
    .eq('status', 'published')
    .maybeSingle()

  if (opError || !operator) {
    console.error('Failed to load operator for chat context', { operatorId, error: opError })
    return null
  }

  const { data: rooms } = await supabase
    .from('room_types')
    .select('name, description, price_per_night, currency, max_guests')
    .eq('operator_id', operatorId)
    .order('sort_order', { ascending: true })

  const roomLines = ((rooms ?? []) as RoomTypeRow[])
    .map(
      (r) =>
        `  - ${r.name}: ${r.currency}${r.price_per_night}/night, up to ${r.max_guests} guests${
          r.description ? ` — ${r.description}` : ''
        }`
    )
    .join('\n')

  return `Property: ${operator.name}${operator.tagline ? ` — ${operator.tagline}` : ''}
Location: ${[operator.city, operator.country].filter(Boolean).join(', ') || 'not specified'}
Description: ${operator.description || 'not provided'}
Price range: ${operator.price_range || 'not specified'}
Check-in: ${operator.check_in || 'not specified'} · Check-out: ${operator.check_out || 'not specified'}
Amenities: ${(operator.amenities ?? []).length > 0 ? operator.amenities.join(', ') : 'not listed'}
Fichua Verified: ${operator.is_verified ? 'yes' : 'not yet'}
Rooms:
${roomLines || '  (no room types listed yet)'}`
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
    .select('id, message, sender_type, created_at, visitor_name, language, operator_id')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (historyError) {
    console.error('Failed to load session history', { error: historyError })
    return jsonResponse({ error: 'Failed to load history' }, 500)
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
  const operatorId = lastMessage.operator_id || null

  let systemPrompt = GENERIC_SYSTEM_PROMPT.replace('{LANGUAGE}', languageName)

  if (operatorId) {
    const propertyContext = await buildPropertyContext(supabase, operatorId)
    if (propertyContext) {
      systemPrompt = PROPERTY_SYSTEM_PROMPT.replace('{LANGUAGE}', languageName).replace(
        '{PROPERTY_CONTEXT}',
        propertyContext
      )
    }
    // If the operator lookup fails for some reason, fall back to the
    // generic prompt rather than answering with no grounding at all.
  }

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
        system: systemPrompt,
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
    operator_id: operatorId,
  })

  if (insertError) {
    console.error('Failed to insert agent reply', { error: insertError })
    return jsonResponse({ error: 'Failed to save reply' }, 500)
  }

  console.log('Agent replied', {
    session_id: sessionId,
    visitor_name: visitorName,
    language: languageCode,
    operator_id: operatorId,
    reply_length: replyText.length,
  })

  return jsonResponse({ success: true })
})
