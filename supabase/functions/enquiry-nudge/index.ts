import { createClient } from 'npm:@supabase/supabase-js@2'

// Operator-assist agent. Called by the escalation cron when an enquiry
// has gone unanswered.
//
// DESIGN INTENT
// Fichua stays out of the traveller/operator conversation. So when an
// enquiry goes cold, this does NOT message the traveller pretending to be
// the operator, and does NOT insert Fichua into the thread. It nudges the
// OPERATOR and hands them a ready-to-send draft reply, grounded in their
// own listing data, so responding costs them one tap instead of five
// minutes of typing.
//
// That distinction matters: an AI answering on the operator's behalf,
// unannounced, would be exactly the kind of quiet substitution the trust
// positioning rules out. Drafting a reply the operator chooses to send is
// assistance. Sending it for them is impersonation.
//
// Two kinds:
//   operator_nudge   -> the operator, with a suggested reply
//   team_escalation  -> the Fichua team, because a lead is going cold

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'
const SITE_URL = 'https://fichua.co'

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface RoomRow {
  name: string
  price_per_night: number
  currency: string
  max_guests: number
}

// Draft a reply the operator can send as-is. Grounded strictly in their
// own listing so it can never invent a price or an amenity -- the same
// rule the traveller-facing agent follows.
async function draftReply(
  anthropicKey: string,
  operatorName: string,
  rooms: RoomRow[],
  enquiryMessage: string | null,
  channel: string
): Promise<string | null> {
  const roomLines = rooms
    .map((r) => `- ${r.name}: ${r.currency}${r.price_per_night}/night, up to ${r.max_guests} guests`)
    .join('\n')

  const system = `You are helping the owner of ${operatorName} reply to a traveller enquiry that arrived via Fichua.

Write the reply AS THE OPERATOR, in first person, ready for them to send on ${channel} with no editing.

Their real rooms and rates:
${roomLines || '(no room types listed)'}

Rules:
- Warm, direct, human. 2-4 short sentences. No corporate padding.
- Answer only from the rates and rooms above. Never invent a price, a room, an amenity, or availability for specific dates.
- If the traveller asked about specific dates, say you'll confirm those dates rather than claiming availability you don't know.
- Invite them to book through the Fichua page so their payment is protected -- mention it naturally, in one short clause, not as a sales pitch.
- No subject line, no signature block, no placeholders like [Name]. Just the message body.`

  const userMsg = enquiryMessage
    ? `The traveller wrote: "${enquiryMessage}"`
    : `A traveller has just made contact via the ${channel} link on the listing but hasn't said much yet. Write a brief, welcoming opener that invites them to say what dates they're considering.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system,
        messages: [{ role: 'user', content: userMsg }],
      }),
    })
    if (!res.ok) {
      console.error('Anthropic error', { status: res.status, body: (await res.text()).slice(0, 400) })
      return null
    }
    const data = await res.json()
    const text = (data.content ?? [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('\n')
      .trim()
    return text || null
  } catch (error) {
    console.error('Anthropic request threw', { error: String(error) })
    return null
  }
}

async function sendEmail(
  supabaseUrl: string,
  serviceKey: string,
  templateName: string,
  templateData: Record<string, unknown>,
  recipientEmail?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({
        templateName,
        recipientEmail,
        idempotencyKey: `${templateName}-${templateData.reference}`,
        templateData,
      }),
    })
    if (!res.ok) {
      console.error('Email send failed', { templateName, status: res.status })
      return false
    }
    return true
  } catch (error) {
    console.error('Email request threw', { templateName, error: String(error) })
    return false
  }
}

// WhatsApp to the operator. Same graceful-skip pattern as elsewhere:
// works the moment Meta credentials exist, silent no-op until then.
async function sendOperatorWhatsApp(to: string, body: string): Promise<{ sent: boolean; reason?: string }> {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  if (!token || !phoneNumberId) return { sent: false, reason: 'whatsapp_not_configured' }
  if (!to) return { sent: false, reason: 'no_operator_number' }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }),
    })
    if (!res.ok) {
      console.error('WhatsApp send failed', { status: res.status, body: (await res.text()).slice(0, 300) })
      return { sent: false, reason: `whatsapp_error_${res.status}` }
    }
    return { sent: true }
  } catch (error) {
    return { sent: false, reason: 'whatsapp_exception' }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  let enquiryId: string
  let kind: string
  try {
    const body = await req.json()
    enquiryId = String(body.enquiry_id ?? '')
    kind = String(body.kind ?? 'operator_nudge')
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }
  if (!enquiryId) return jsonResponse({ error: 'Missing enquiry_id' }, 400)

  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: enquiry, error: eErr } = await supabase
    .from('enquiries')
    .select('id, reference, operator_id, channel, initial_message, created_at, responded_at')
    .eq('id', enquiryId)
    .maybeSingle()

  if (eErr || !enquiry) return jsonResponse({ error: 'Enquiry not found' }, 404)

  // Raced with the operator acknowledging -- nothing to chase.
  if (enquiry.responded_at) {
    return jsonResponse({ skipped: true, reason: 'already_responded' })
  }

  const { data: operator } = await supabase
    .from('operators')
    .select('name, slug, email, phone')
    .eq('id', enquiry.operator_id)
    .maybeSingle()

  if (!operator) return jsonResponse({ error: 'Operator not found' }, 404)

  const { data: rooms } = await supabase
    .from('room_types')
    .select('name, price_per_night, currency, max_guests')
    .eq('operator_id', enquiry.operator_id)
    .order('price_per_night', { ascending: true })

  const waitedMinutes = Math.round(
    (Date.now() - new Date(enquiry.created_at as string).getTime()) / 60000
  )
  const ackUrl = `${SITE_URL}/enquiry/${enquiry.reference}`

  if (kind === 'team_escalation') {
    const ok = await sendEmail(supabaseUrl, serviceKey, 'enquiry-escalation', {
      reference: enquiry.reference,
      operatorName: operator.name,
      channel: enquiry.channel,
      waitedMinutes: String(waitedMinutes),
      message: enquiry.initial_message || '(no message captured)',
    })
    console.log('Team escalation', { reference: enquiry.reference, emailed: ok, waitedMinutes })
    return jsonResponse({ kind, emailed: ok })
  }

  // Operator nudge, with a draft they can send as-is.
  let draft: string | null = null
  if (anthropicKey) {
    draft = await draftReply(
      anthropicKey,
      operator.name as string,
      (rooms ?? []) as RoomRow[],
      enquiry.initial_message as string | null,
      enquiry.channel as string
    )
  }

  const waMessage =
    `A traveller contacted you ${waitedMinutes} min ago via Fichua (${enquiry.reference}) ` +
    `and is still waiting.\n\n` +
    (draft ? `Suggested reply — copy and send:\n\n"${draft}"\n\n` : '') +
    `Already replied? Tap to confirm: ${ackUrl}`

  const [wa, emailed] = await Promise.all([
    sendOperatorWhatsApp(operator.phone as string, waMessage),
    operator.email
      ? sendEmail(
          supabaseUrl,
          serviceKey,
          'enquiry-nudge',
          {
            reference: enquiry.reference,
            operatorName: operator.name,
            channel: enquiry.channel,
            waitedMinutes: String(waitedMinutes),
            message: enquiry.initial_message || '(no message captured)',
            draft: draft || '',
            ackUrl,
          },
          operator.email as string
        )
      : Promise.resolve(false),
  ])

  console.log('Operator nudge', {
    reference: enquiry.reference,
    waitedMinutes,
    had_draft: !!draft,
    whatsapp: wa,
    emailed,
  })

  return jsonResponse({ kind, whatsapp: wa, emailed, had_draft: !!draft })
})
