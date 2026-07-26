// Photo QA agent for operator listings. Given a set of image URLs already
// uploaded by the operator, it categorizes each photo against standard
// booking-platform categories (exterior, bedroom, bathroom, common area,
// amenity, food), flags quality issues (lighting/blur/framing), recommends
// a cover photo, lists which categories are missing entirely, and flags
// anything that looks like it may have been deceptively edited (objects
// added/removed, unnatural sky/water color, inconsistent lighting).
//
// Deliberately does NOT alter or generate any image. It only critiques
// what the operator already uploaded — sourcing or editing images is a
// separate, human-in-the-loop step (consent-gated import from the
// operator's own linked social accounts, or manual re-upload after they
// retake a shot). This function is read-only analysis.
//
// Admin-triggered from /intranet/operators, not run automatically on a
// schedule — keeps Anthropic API cost bounded and predictable.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'
const MAX_PHOTOS = 8

const CATEGORIES = ['exterior', 'bedroom', 'bathroom', 'common_area', 'amenity', 'food', 'other']

const SYSTEM_PROMPT = `You are a photo quality reviewer for Fichua, a booking platform for independent tourism operators. You are shown a numbered set of real photos an operator uploaded for their own listing.

For EACH photo, determine:
- "category": one of ${JSON.stringify(CATEGORIES)}
- "quality": "good", "needs_work", or "poor" — based on lighting, framing, blur, and whether it clearly shows the space
- "quality_note": a short, specific reason for the quality rating (e.g. "dark and slightly blurry", "well-lit, good angle")
- "authenticity_flag": "none" or "possibly_edited" — flag "possibly_edited" ONLY if you see signs of deceptive digital editing such as an inserted/removed object, an unnaturally perfect sky, water color that looks composited, or lighting inconsistent with the rest of the shot. Do not flag normal exposure/color correction or cropping — only flag things that would misrepresent the actual property to a traveler.

Then, across all photos together, determine:
- "recommendedCoverIndex": the index (0-based) of the single strongest photo to use as the cover/hero image
- "missingCategories": which of ${JSON.stringify(CATEGORIES.filter((c) => c !== 'other'))} have NO photo representing them at all

Respond with ONLY valid JSON, no markdown, in this exact shape:
{
  "photos": [{ "index": 0, "category": "...", "quality": "...", "quality_note": "...", "authenticity_flag": "..." }, ...],
  "recommendedCoverIndex": 0,
  "missingCategories": ["..."]
}`

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mediaType: string } | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) return null
    const buf = new Uint8Array(await res.arrayBuffer())
    // Chunked conversion avoids call-stack blowups on larger images.
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < buf.length; i += chunkSize) {
      binary += String.fromCharCode(...buf.subarray(i, i + chunkSize))
    }
    return { base64: btoa(binary), mediaType: contentType.split(';')[0] }
  } catch (error) {
    console.error('Failed to fetch image', { url, error: String(error) })
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthropicKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  let urls: string[]
  try {
    const body = await req.json()
    urls = Array.isArray(body.images) ? body.images.filter((u: unknown) => typeof u === 'string') : []
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  if (urls.length === 0) {
    return jsonResponse({ error: 'No image URLs provided' }, 400)
  }

  const trimmedUrls = urls.slice(0, MAX_PHOTOS)

  const fetched = await Promise.all(trimmedUrls.map(fetchImageAsBase64))
  const validIndices: number[] = []
  const content: Record<string, unknown>[] = []
  fetched.forEach((img, i) => {
    if (!img) return
    validIndices.push(i)
    content.push({ type: 'text', text: `Photo ${validIndices.length - 1}:` })
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
    })
  })

  if (content.length === 0) {
    return jsonResponse({ error: 'Could not fetch any of the provided image URLs' }, 422)
  }

  content.push({ type: 'text', text: 'Analyze the photos above per the instructions and respond with the JSON object only.' })

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
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('Anthropic API error', { status: aiResponse.status, body: errText.slice(0, 500) })
      return jsonResponse({ error: 'AI request failed' }, 502)
    }

    const aiData = await aiResponse.json()
    const rawText = (aiData.content ?? [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('')
      .trim()

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in AI response', { rawText: rawText.slice(0, 500) })
      return jsonResponse({ error: 'Could not parse AI response' }, 502)
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Map analysis indices (which skip any URLs that failed to fetch) back
    // to the original URL list so the client can match results to photos.
    const photosWithUrls = (parsed.photos ?? []).map((p: Record<string, unknown>, i: number) => ({
      ...p,
      url: trimmedUrls[validIndices[i]],
    }))
    const recommendedCoverUrl =
      typeof parsed.recommendedCoverIndex === 'number' && validIndices[parsed.recommendedCoverIndex] !== undefined
        ? trimmedUrls[validIndices[parsed.recommendedCoverIndex]]
        : null

    return jsonResponse({
      photos: photosWithUrls,
      missingCategories: parsed.missingCategories ?? [],
      recommendedCoverUrl,
      skipped: urls.length > trimmedUrls.length ? urls.length - trimmedUrls.length : 0,
      failedToFetch: trimmedUrls.length - validIndices.length,
    })
  } catch (error) {
    console.error('Photo analysis failed', { error: String(error) })
    return jsonResponse({ error: 'AI request failed' }, 502)
  }
})
