import { createClient } from 'npm:@supabase/supabase-js@2'

// Receives Mailgun's inbound-route webhook (the forward() action -- see
// https://documentation.mailgun.com/docs/mailgun/user-manual/receive-forward-store/receive-http)
// for any email sent to the inbound address (e.g. support@support.fichua.co),
// verifies it's really from Mailgun, and drops it into the same
// chat_messages thread system that already powers the site chat widget --
// same admin inbox (/admin/chat), same human-takeover rule, same AI agent.
//
// Flow: verify HMAC signature -> find-or-create a stable session_id for
// this sender's email address -> insert the message (channel='email',
// visitor_email set) -> fire-and-forget invoke chat-agent-reply, exactly
// like the site widget does after a visitor sends a message.
//
// The other half of the round trip (an admin/agent reply actually being
// emailed back out) is handled by a Postgres trigger on chat_messages,
// not by this function -- see the accompanying migration.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function verifyMailgunSignature(
  signingKey: string,
  timestamp: string,
  token: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp + token))
  const computedHex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  // Timing-safe-ish comparison (lengths already fixed/known for hex digests).
  if (computedHex.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < computedHex.length; i++) {
    diff |= computedHex.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

// Deterministic, filesystem-safe-ish session key so repeated emails from
// the same address keep landing in the same thread.
async function sessionIdForEmail(email: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase().trim()))
  const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return `email-${hex.slice(0, 24)}`
}

function parseDisplayName(fromHeader: string, fallbackEmail: string): string {
  // "Bob <bob@example.com>" -> "Bob"; falls back to the local-part of the email.
  const match = fromHeader.match(/^\s*"?([^"<]*?)"?\s*<[^>]+>\s*$/)
  const name = match?.[1]?.trim()
  if (name) return name
  return fallbackEmail.split('@')[0]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const signingKey = Deno.env.get('MAILGUN_WEBHOOK_SIGNING_KEY')

  if (!supabaseUrl || !supabaseServiceKey || !signingKey) {
    console.error('Missing required environment variables', {
      has_supabase_url: !!supabaseUrl,
      has_service_key: !!supabaseServiceKey,
      has_signing_key: !!signingKey,
    })
    return new Response('Server configuration error', { status: 500, headers: corsHeaders })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch (error) {
    console.error('Failed to parse form data', { error: String(error) })
    return new Response('Invalid payload', { status: 400, headers: corsHeaders })
  }

  const timestamp = String(form.get('timestamp') ?? '')
  const token = String(form.get('token') ?? '')
  const signature = String(form.get('signature') ?? '')

  if (!timestamp || !token || !signature) {
    return new Response('Missing signature fields', { status: 406, headers: corsHeaders })
  }

  const valid = await verifyMailgunSignature(signingKey, timestamp, token, signature)
  if (!valid) {
    console.error('Invalid Mailgun signature -- rejecting')
    // 406 tells Mailgun not to retry (per their docs) -- an invalid
    // signature will never become valid on retry.
    return new Response('Invalid signature', { status: 406, headers: corsHeaders })
  }

  const fromHeader = String(form.get('from') ?? '')
  const sender = String(form.get('sender') ?? '').trim().toLowerCase()
  const subject = String(form.get('subject') ?? '(no subject)')
  const bodyText = String(form.get('stripped-text') ?? form.get('body-plain') ?? '').trim()

  if (!sender) {
    return new Response('Missing sender', { status: 406, headers: corsHeaders })
  }
  if (!bodyText) {
    // Nothing to act on (e.g. an empty auto-reply) -- accept so Mailgun
    // doesn't retry, but don't create a thread over nothing.
    return new Response('OK (empty body, skipped)', { status: 200, headers: corsHeaders })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const sessionId = await sessionIdForEmail(sender)
  const visitorName = parseDisplayName(fromHeader, sender)

  const { error: insertError } = await supabase.from('chat_messages').insert({
    session_id: sessionId,
    sender_type: 'visitor',
    channel: 'email',
    visitor_name: visitorName,
    visitor_email: sender,
    message: bodyText.length > 4000 ? `${bodyText.slice(0, 4000)}…` : bodyText,
    language: 'en',
  })

  if (insertError) {
    console.error('Failed to insert inbound email as chat message', { error: insertError, sender, subject })
    return new Response('Failed to store message', { status: 500, headers: corsHeaders })
  }

  // Fire-and-forget: let the existing agent logic (human-takeover rule
  // included) decide whether to reply, exactly as it does for site chat.
  fetch(`${supabaseUrl}/functions/v1/chat-agent-reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ session_id: sessionId }),
  }).catch((error) => {
    console.error('Failed to invoke chat-agent-reply', { error: String(error), sessionId })
  })

  console.log('Inbound email stored', { sessionId, sender, subject })
  return new Response('OK', { status: 200, headers: corsHeaders })
})
