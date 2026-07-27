import { createClient } from 'npm:@supabase/supabase-js@2'

// Fires on every new operator sign-up. Three jobs, each independent so a
// failure in one never blocks the others:
//   1. email the Fichua team
//   2. WhatsApp the Fichua team
//   3. acknowledge the operator by email, if they gave one
//
// Invoked by a database trigger on operator_leads rather than from the
// browser, so a notification can't be skipped by a client that closes
// the tab, loses connection, or is a bot posting straight to the API.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Lead {
  id: string
  property_name: string
  phone: string | null
  email: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  facebook_handle: string | null
  num_rooms: number | null
  price_min: number | null
  price_max: number | null
  created_at: string
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// --- WhatsApp (Meta Cloud API) -------------------------------------
//
// Meta only allows free-form ("session") messages within 24 hours of the
// recipient last messaging the business number. Outside that window a
// pre-approved template is required.
//
// So: if WHATSAPP_TEAM_TEMPLATE is set we send a template (reliable at
// any time); otherwise we send free-form text, which works when the team
// number has messaged the business number recently. Either way the
// function never throws -- WhatsApp is a convenience channel here, email
// is the channel of record.
async function notifyTeamWhatsApp(lead: Lead): Promise<{ sent: boolean; reason?: string }> {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  const teamNumber = Deno.env.get('FICHUA_TEAM_WHATSAPP')
  const templateName = Deno.env.get('WHATSAPP_TEAM_TEMPLATE')
  const templateLang = Deno.env.get('WHATSAPP_TEAM_TEMPLATE_LANG') || 'en'

  if (!token || !phoneNumberId || !teamNumber) {
    // Expected until Meta approval lands. Not an error.
    return { sent: false, reason: 'whatsapp_not_configured' }
  }

  const summary =
    `New Fichua sign-up: ${lead.property_name}` +
    (lead.phone ? ` · ${lead.phone}` : '') +
    (lead.num_rooms ? ` · ${lead.num_rooms} rooms` : '')

  const body = templateName
    ? {
        messaging_product: 'whatsapp',
        to: teamNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateLang },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: lead.property_name },
                { type: 'text', text: lead.phone || 'no number given' },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to: teamNumber,
        type: 'text',
        text: { body: `${summary}\n\nReview: https://fichua.co/intranet/operators` },
      }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('WhatsApp send failed', { status: res.status, body: errText.slice(0, 400) })
      return { sent: false, reason: `whatsapp_error_${res.status}` }
    }
    return { sent: true }
  } catch (error) {
    console.error('WhatsApp request threw', { error: String(error) })
    return { sent: false, reason: 'whatsapp_exception' }
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        templateName,
        recipientEmail,
        idempotencyKey: `${templateName}-${templateData.leadId}`,
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase environment variables')
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  let leadId: string
  try {
    const body = await req.json()
    leadId = String(body.lead_id ?? '')
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }
  if (!leadId) return jsonResponse({ error: 'Missing lead_id' }, 400)

  // Re-read the lead server-side rather than trusting anything posted in.
  const supabase = createClient(supabaseUrl, serviceKey)
  const { data: lead, error } = await supabase
    .from('operator_leads')
    .select('*')
    .eq('id', leadId)
    .maybeSingle()

  if (error || !lead) {
    console.error('Lead not found', { leadId, error })
    return jsonResponse({ error: 'Lead not found' }, 404)
  }

  const l = lead as Lead
  const socials = [
    l.instagram_handle ? `Instagram: ${l.instagram_handle}` : null,
    l.tiktok_handle ? `TikTok: ${l.tiktok_handle}` : null,
    l.facebook_handle ? `Facebook: ${l.facebook_handle}` : null,
  ].filter(Boolean).join(' · ')

  const priceRange =
    l.price_min != null && l.price_max != null
      ? `${l.price_min}–${l.price_max}`
      : l.price_min != null
        ? `from ${l.price_min}`
        : 'not given'

  const templateData = {
    leadId: l.id,
    propertyName: l.property_name,
    phone: l.phone || 'not given',
    email: l.email || 'not given',
    socials: socials || 'none given',
    numRooms: l.num_rooms != null ? String(l.num_rooms) : 'not given',
    priceRange,
  }

  // All three run regardless of each other's outcome.
  const [adminEmail, whatsapp, ack] = await Promise.all([
    sendEmail(supabaseUrl, serviceKey, 'new-lead-admin', templateData),
    notifyTeamWhatsApp(l),
    l.email
      ? sendEmail(supabaseUrl, serviceKey, 'lead-acknowledgement', templateData, l.email)
      : Promise.resolve(false),
  ])

  console.log('New lead notifications', {
    leadId: l.id,
    property: l.property_name,
    admin_email: adminEmail,
    whatsapp_sent: whatsapp.sent,
    whatsapp_reason: whatsapp.reason,
    operator_ack: ack,
  })

  // Always 200: the lead is already saved, and the trigger must not
  // retry or surface an error to the person signing up.
  return jsonResponse({
    success: true,
    admin_email: adminEmail,
    whatsapp: whatsapp,
    operator_ack: ack,
  })
})
