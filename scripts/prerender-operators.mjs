// Build-time prerender for the homepage and operator pages.
//
// WHY THIS EXISTS
// This project is a client-rendered Vite SPA: every URL returns the same
// empty shell, and the operator's name, prices and JSON-LD only appear
// after JavaScript runs. Googlebot eventually renders JS on a second
// pass, but most AI answer engines (ChatGPT, Perplexity, Claude web,
// Bing's LLM indexer) and every social preview crawler do NOT execute
// JS -- so today they see nothing at all on an operator page. That
// defeats the entire point of publishing structured data.
//
// This runs AFTER `vite build` and writes one real HTML file per
// published operator into dist/operators/<slug>/index.html, containing:
//   * a per-operator <title> and meta description
//   * Open Graph / Twitter tags so link previews show the property
//   * the full LodgingBusiness JSON-LD, including per-room Offer objects
//     and an AggregateRating -- identical in shape to what
//     OperatorProfile.tsx emits at runtime
//   * readable body text (description, rooms with prices, location)
//
// The body text matters as much as the schema: AI crawlers read prose,
// not just machine-readable blocks. React replaces #root on hydration,
// so humans see the normal app and only crawlers ever read the static
// copy.
//
// Fails soft: any fetch problem logs a warning and leaves the build
// intact rather than breaking the deploy.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SITE_URL = 'https://fichua.co'

const HOME_FAQS = [
  ['Who is Fichua for?', 'Fichua is for independent lodges, guesthouses, camps and distinctive stays in East and West Africa that want to be found online and take more bookings directly.'],
  ['What does Fichua cost?', '$99 per month, plus 7% on the bookings Fichua brings you. You pay nothing until Fichua has delivered ten bookings.'],
  ['How does Fichua help guests find my lodge?', 'Fichua publishes a verified, structured property page with your rooms, prices, location and contact details so travellers, search engines and AI assistants can understand and cite your lodge.'],
  ['Do I keep the guest relationship?', 'Yes. Your lodge owns the guest relationship. There is no exclusivity or lock-in, and your real price is shown clearly to the traveller.'],
  ['Can I stay on Booking.com and other platforms?', 'Yes. Fichua has no exclusivity, so you can keep every listing you have today. Fichua adds a direct channel alongside them, and each direct booking costs you 7% instead of 15–20%.'],
  ['How and when do I get paid? Can I use mobile money?', 'Fichua confirms your payout method before your page goes live. Available bank or mobile-money options, payout timing and any processor fees depend on your country and are confirmed with you during onboarding.'],
  ['How long does it take to go live?', 'There is no fixed promise because verification time depends on how quickly we can confirm your identity, ownership, photos, GPS location, WhatsApp number and payout details. We tell you what is still needed at each step.'],
  ['Which countries does Fichua cover?', 'Fichua is starting with a pilot in Rwanda and is recruiting independent stays across East and West Africa. Outside Rwanda, contact us and we will confirm whether onboarding and payouts are ready in your country.'],
  ['What does Fichua Verified mean for guests?', 'It means Fichua has confirmed the operator’s identity and ownership, checked property photos against its GPS location, reached a real person on WhatsApp, and confirmed a payout account before publishing the listing.'],
]

function buildHomepageJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Fichua',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/og-image.jpg`,
      email: 'tr@fichua.co',
      description: 'Fichua helps independent lodges in East and West Africa get found and take more direct bookings.',
      sameAs: ['https://instagram.com/fichua', 'https://linkedin.com/company/fichua', 'https://x.com/fichua'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${SITE_URL}/#product`,
      name: 'Fichua for Independent Lodges',
      brand: { '@id': `${SITE_URL}/#organization` },
      audience: { '@type': 'BusinessAudience', audienceType: 'Independent lodges in East and West Africa' },
      description: 'A verified property page, AI-search visibility and direct booking service for independent African lodges.',
      url: `${SITE_URL}/`,
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/#pricing`,
        description: 'Flat $99 monthly subscription, plus 7% on bookings delivered by Fichua. Nothing due until ten bookings are delivered.',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: HOME_FAQS.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ]
}

function buildHomepageBody() {
  const faqs = HOME_FAQS.map(([question, answer]) => `<h3>${esc(question)}</h3><p>${esc(answer)}</p>`).join('')
  return `<main>
      <section><p>Now onboarding in Rwanda · For independent lodges across East & West Africa</p><h1>Keep up to $130 more on every $1,000 booking.</h1><p>Fichua helps independent lodges get found by travellers, Google and AI — then take verified direct bookings at 7%, not the 15–20% charged by large platforms.</p><a href="#contact">Make me visible</a><p>Nothing to pay until Fichua has delivered 10 bookings.</p></section>
      <section><h2>Be visible. Be bookable. Increase your revenue.</h2><p>And keep more when you do. On a $1,000 booking, Fichua saves $80–$130 compared with a platform charging 15%–20% — so your $99 subscription pays for itself after one or two bookings.</p><table><thead><tr><th>On each booking</th><th>Fichua</th><th>Large platforms</th></tr></thead><tbody><tr><th>Commission on a $1,000 booking</th><td>$70</td><td>$150 (15%) – $200 (20%)</td></tr><tr><th>Revenue you keep</th><td>$930</td><td>$800–$850</td></tr><tr><th>Saving with Fichua</th><td>$80–$130</td><td>—</td></tr></tbody></table><form aria-label="Savings calculator"><p>Use your numbers</p><h3>Calculate your monthly savings</h3><p>Enter the bookings you expect Fichua to bring and what each booking is worth.</p><label for="prerender-calc-value">Average booking value ($)</label><input id="prerender-calc-value" name="booking_value" type="number" inputmode="decimal" min="0" value="1000"><label for="prerender-calc-count">Bookings from Fichua per month</label><input id="prerender-calc-count" name="bookings" type="number" inputmode="numeric" min="0" value="4"><p>At these example values: $320–$520 commission saved; $99 monthly subscription; $221–$421 extra revenue kept.</p></form><p><a href="/sample-lodge">See a fictional sample lodge page</a>.</p></section>
      <section><h2>Be visible. Be bookable. Increase your revenue. Keep more.</h2><p>Fichua publishes your verified rooms, prices and location as structured information search engines and AI assistants can understand, then gives guests a direct path to book.</p></section>
      <section id="pricing"><h2>$99 a month. Plus 7% on the bookings we bring you.</h2><p>One flat rate to be visible, and 7% on delivered bookings. You pay nothing until Fichua has delivered ten bookings.</p></section>
      <section><h2>How Fichua works</h2><ol><li>Tell us about your lodge.</li><li>We verify your identity, location and payout details.</li><li>Your page goes live for direct bookings.</li></ol></section>
      <section><h2>What lodge owners ask first.</h2>${faqs}</section>
      <section id="contact"><h2>Put your lodge where guests can find it.</h2><p>Submit your property name and WhatsApp number to start. No upfront fee. No contract.</p><form aria-label="List your lodge with Fichua"><label for="prerender-property">Lodge or property name</label><input id="prerender-property" name="property_name" type="text" required><label for="prerender-whatsapp">WhatsApp number</label><input id="prerender-whatsapp" name="phone" type="tel" required><label for="prerender-email">Email (optional)</label><input id="prerender-email" name="email" type="email"><input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="utm_content"><button type="submit">Make me visible</button></form></section>
    </main>`
}

function renderSampleLodge(shell) {
  const canonical = `${SITE_URL}/sample-lodge`
  const title = 'Imara Hills Lodge — Fictional Fichua Demo'
  const desc = 'See how Fichua presents a verified lodge to travellers, search engines and AI assistants.'
  const image = `${SITE_URL}/sample-lodge.jpg`
  const sampleSchema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Imara Hills Lodge',
    address: { '@type': 'PostalAddress', addressLocality: 'Musanze', addressCountry: 'Rwanda' },
    priceRange: '$120–$210',
    amenityFeature: ['Breakfast included', 'Private terrace', 'Mountain view'],
    makesOffer: [
      { '@type': 'Offer', name: 'Garden Room', price: 120, priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Family Cottage', price: 210, priceCurrency: 'USD' },
    ],
  }
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}">`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${desc}">`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${desc}">`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}">`)
    .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${image}">`)
    .replace('</head>', `  <meta name="robots" content="noindex, nofollow">\n  <link rel="canonical" href="${canonical}">\n  <script type="application/ld+json">${jsonLdSafe(sampleSchema)}</script>\n</head>`)
  html = html.replace('<div id="root"></div>', `<div id="root"><main><p>Fictional demonstration — not a real property and not available to book</p><h1>Imara Hills Lodge</h1><p>Musanze, Rwanda</p><figure><img src="/sample-lodge.jpg" alt="Fictional lodge among green hills"><figcaption>Demo property photo</figcaption></figure><p>Fichua Verified: identity and ownership, property location, WhatsApp reachability and payout account checked.</p><h2>Rooms and real prices</h2><article><h3>Garden Room</h3><p>$120 per night. Breakfast included. Private terrace.</p></article><article><h3>Family Cottage</h3><p>$210 per night. Sleeps four. Mountain view.</p></article><section><h2>What AI assistants read</h2><p>Fichua publishes the property type, verified location, room names, prices and amenities in Schema.org format.</p><pre><code>${esc(JSON.stringify(sampleSchema, null, 2))}</code></pre></section><button type="button" disabled>Book on WhatsApp · Demo</button><p><a href="/#contact">Build my lodge page</a></p></main></div>`)
  return html
}

function renderHomepage(shell) {
  const canonical = `${SITE_URL}/`
  const schema = buildHomepageJsonLd().map((item) => `<script type="application/ld+json">${jsonLdSafe(item)}</script>`).join('\n  ')
  let html = shell.replace('</head>', `  <link rel="canonical" href="${canonical}">\n  ${schema}\n</head>`)
  html = html.replace('<div id="root"></div>', `<div id="root">${buildHomepageBody()}</div>`)
  return html
}

function loadEnv() {
  const envPath = path.join(ROOT, '.env')
  const env = {}
  if (!existsSync(envPath)) return env
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

// Escape for use in HTML text/attribute contexts. Operator-supplied
// content is untrusted, and this file is written verbatim to disk.
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// JSON-LD sits inside a <script> block, so the only real hazard is a
// literal </script> sequence terminating the block early.
function jsonLdSafe(obj) {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script')
}

async function api(env, pathAndQuery) {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers: {
      apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  })
  if (!res.ok) throw new Error(`${pathAndQuery} -> ${res.status}`)
  return res.json()
}

function buildJsonLd(op, rooms, reviews) {
  const approved = reviews.filter((r) => r.moderation_status === 'approved')
  const avg =
    approved.length > 0
      ? approved.reduce((s, r) => s + Number(r.rating), 0) / approved.length
      : null

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: op.name,
    description: op.description,
    url: `${SITE_URL}/operators/${op.slug}`,
    image: [op.hero_image, ...(op.images || [])].filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      streetAddress: op.address,
      addressLocality: op.city,
      addressCountry: op.country,
    },
    ...(op.lat && op.lng
      ? { geo: { '@type': 'GeoCoordinates', latitude: op.lat, longitude: op.lng } }
      : {}),
    telephone: op.phone,
    priceRange: op.price_range,
    ...(op.star_rating
      ? { starRating: { '@type': 'Rating', ratingValue: op.star_rating } }
      : {}),
    checkinTime: op.check_in,
    checkoutTime: op.check_out,
    currenciesAccepted: (op.currencies_accepted || []).join(', '),
    paymentAccepted: (op.payment_accepted || []).join(', '),
    amenityFeature: (op.amenities || []).map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
    numberOfRooms: rooms.length,
    ...(avg
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avg.toFixed(1),
            reviewCount: approved.length,
          },
        }
      : {}),
    ...(op.instagram_url || op.tripadvisor_url
      ? { sameAs: [op.instagram_url, op.tripadvisor_url].filter(Boolean) }
      : {}),
    ...(rooms.length > 0
      ? {
          makesOffer: rooms.map((r) => ({
            '@type': 'Offer',
            name: r.name,
            ...(r.description ? { description: r.description } : {}),
            price: r.price_per_night,
            priceCurrency: r.currency,
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/operators/${op.slug}#book`,
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: r.price_per_night,
              priceCurrency: r.currency,
              unitCode: 'DAY',
            },
            itemOffered: {
              '@type': 'HotelRoom',
              name: r.name,
              occupancy: {
                '@type': 'QuantitativeValue',
                maxValue: r.max_guests,
                unitCode: 'C62',
              },
            },
          })),
        }
      : {}),
  }
}

// Plain, readable content for crawlers that don't run JavaScript.
// Replaced by React on hydration, so no human sees this.
function buildBody(op, rooms) {
  const location = [op.city, op.country].filter(Boolean).join(', ')
  const roomList = rooms
    .map(
      (r) =>
        `<li><strong>${esc(r.name)}</strong> — ${esc(r.currency)}${esc(
          r.price_per_night
        )} per night, sleeps up to ${esc(r.max_guests)}${
          r.description ? `. ${esc(r.description)}` : ''
        }</li>`
    )
    .join('\n        ')

  return `
      <article>
        <h1>${esc(op.name)}</h1>
        ${op.tagline ? `<p>${esc(op.tagline)}</p>` : ''}
        ${location ? `<p>Location: ${esc(location)}</p>` : ''}
        ${op.description ? `<p>${esc(op.description)}</p>` : ''}
        ${op.is_verified ? '<p>Fichua Verified: identity, location, reachability and payout account confirmed.</p>' : ''}
        ${rooms.length > 0 ? `<h2>Rooms and nightly rates</h2>\n        <ul>\n        ${roomList}\n        </ul>` : ''}
        ${(op.amenities || []).length > 0 ? `<h2>Amenities</h2>\n        <p>${esc((op.amenities || []).join(', '))}</p>` : ''}
        ${op.check_in || op.check_out ? `<p>Check-in: ${esc(op.check_in || 'n/a')} · Check-out: ${esc(op.check_out || 'n/a')}</p>` : ''}
        <p>Book directly with ${esc(op.name)} through Fichua at ${SITE_URL}/operators/${esc(op.slug)}</p>
      </article>`
}

function renderPage(shell, op, rooms, reviews) {
  const location = [op.city, op.country].filter(Boolean).join(', ')
  const title = `${op.name}${location ? ` — ${location}` : ''} | Book direct on Fichua`
  const desc =
    (op.description && op.description.slice(0, 300)) ||
    `${op.name}${location ? ` in ${location}` : ''}. Book direct on Fichua — verified, no middleman markup.`
  const image = op.hero_image || ''
  const canonical = `${SITE_URL}/operators/${op.slug}`

  let html = shell

  // Title + description
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(desc)}">`
  )

  // Per-operator social tags replace the sitewide ones, so a shared link
  // previews as the property rather than as generic Fichua marketing.
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}">`)
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}">`)
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(desc)}">`)
  if (image) {
    html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(image)}">`)
    html = html.replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${esc(image)}">`)
  }

  const jsonLd = buildJsonLd(op, rooms, reviews)
  const head = `  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:url" content="${esc(canonical)}">
  <script type="application/ld+json">${jsonLdSafe(jsonLd)}</script>
</head>`
  html = html.replace('</head>', head)

  html = html.replace('<div id="root"></div>', `<div id="root">${buildBody(op, rooms)}\n    </div>`)

  return html
}

const SELFTEST_OPERATOR = {
  id: 'test-1',
  slug: 'yokan-lodge',
  name: 'Yokan Lodge',
  tagline: 'A quiet river lodge',
  description: 'A boutique eco-lodge on the banks of the river. <script>alert(1)</script>',
  address: '12 River Road',
  city: 'Musanze',
  country: 'Rwanda',
  lat: -1.499,
  lng: 29.634,
  phone: '+250788000000',
  price_range: '$120-$220',
  hero_image: 'https://example.com/hero.jpg',
  images: ['https://example.com/2.jpg'],
  amenities: ['Wi-Fi', 'Breakfast'],
  is_verified: true,
  check_in: '14:00',
  check_out: '10:00',
  currencies_accepted: ['USD'],
  payment_accepted: ['Mobile Money'],
  instagram_url: 'https://instagram.com/yokan',
  tripadvisor_url: null,
  star_rating: null,
}
const SELFTEST_ROOMS = [
  { operator_id: 'test-1', name: 'Garden Room', description: 'Quiet', price_per_night: 120, currency: '$', max_guests: 2 },
  { operator_id: 'test-1', name: 'River Suite', description: null, price_per_night: 220, currency: '$', max_guests: 4 },
]
const SELFTEST_REVIEWS = [
  { operator_id: 'test-1', rating: 5, moderation_status: 'approved' },
  { operator_id: 'test-1', rating: 4, moderation_status: 'approved' },
  { operator_id: 'test-1', rating: 1, moderation_status: 'pending' },
]

function selftest() {
  const shellPath = path.join(DIST, 'index.html')
  if (!existsSync(shellPath)) {
    console.error('[selftest] dist/index.html missing -- run vite build first.')
    process.exit(1)
  }
  const html = renderPage(readFileSync(shellPath, 'utf-8'), SELFTEST_OPERATOR, SELFTEST_ROOMS, SELFTEST_REVIEWS)
  const out = path.join(ROOT, 'selftest-output.html')
  writeFileSync(out, html)

  const checks = [
    ['operator name in title', /<title>Yokan Lodge — Musanze, Rwanda \| Book direct on Fichua<\/title>/],
    ['per-operator meta description', /<meta name="description" content="A boutique eco-lodge/],
    ['canonical url', /<link rel="canonical" href="https:\/\/fichua\.co\/operators\/yokan-lodge">/],
    ['og:title is the operator', /<meta property="og:title" content="Yokan Lodge/],
    ['og:image is the hero', /<meta property="og:image" content="https:\/\/example\.com\/hero\.jpg">/],
    ['JSON-LD present', /<script type="application\/ld\+json">/],
    ['LodgingBusiness type', /"@type":"LodgingBusiness"/],
    ['makesOffer present', /"makesOffer":\[/],
    ['cheapest room offer price', /"price":120/],
    ['second room offer price', /"price":220/],
    ['HotelRoom in offer', /"@type":"HotelRoom"/],
    ['aggregateRating from approved only', /"ratingValue":"4\.5","reviewCount":2/],
    ['geo coordinates', /"latitude":-1\.499/],
    ['readable h1', /<h1>Yokan Lodge<\/h1>/],
    ['room prices in body text', /<strong>Garden Room<\/strong> — \$120 per night, sleeps up to 2/],
    ['verified statement in body', /Fichua Verified: identity, location/],
    ['amenities in body', /Wi-Fi, Breakfast/],
    ['script tag in description escaped', /&lt;script&gt;alert\(1\)&lt;\/script&gt;/],
    ['no raw injected script', /^(?!.*<script>alert\(1\)<\/script>)/s],
  ]

  let failed = 0
  for (const [label, re] of checks) {
    const ok = re.test(html)
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`)
    if (!ok) failed++
  }
  console.log(failed === 0 ? `\n[selftest] All ${checks.length} checks passed. Output: ${out}` : `\n[selftest] ${failed} check(s) FAILED.`)
  process.exit(failed === 0 ? 0 : 1)
}

async function main() {
  if (process.argv.includes('--selftest')) return selftest()
  const shellPath = path.join(DIST, 'index.html')
  if (!existsSync(shellPath)) {
    console.warn('[prerender] dist/index.html not found -- did vite build run? Skipping prerender.')
    return
  }
  const shell = readFileSync(shellPath, 'utf-8')
  const homepage = renderHomepage(shell)
  writeFileSync(shellPath, homepage)
  const sampleDir = path.join(DIST, 'sample-lodge')
  mkdirSync(sampleDir, { recursive: true })
  const samplePage = renderSampleLodge(shell)
  writeFileSync(path.join(sampleDir, 'index.html'), samplePage)
  const homepageChecks = [
    ['visible homepage h1', /<h1>Keep up to \$130 more on every \$1,000 booking\.<\/h1>/],
    ['Organization schema', /"@type":"Organization"/],
    ['Product schema', /"@type":"Product"/],
    ['FAQ schema', /"@type":"FAQPage"/],
    ['lead form fields', /<input id="prerender-property"/],
    ['UTM fields', /name="utm_campaign"/],
    ['Rwanda onboarding', /Now onboarding in Rwanda/],
    ['calculator fields', /id="prerender-calc-room"/],
  ]
  for (const [label, pattern] of homepageChecks) {
    if (!pattern.test(homepage)) throw new Error(`[prerender] Homepage check failed: ${label}`)
  }
  console.log(`[prerender] Homepage — ${homepageChecks.length} checks passed.`)
  if (!/<h1>Imara Hills Lodge<\/h1>/.test(samplePage) || !/noindex, nofollow/.test(samplePage) || !/What AI assistants read/.test(samplePage) || !/Book on WhatsApp · Demo/.test(samplePage) || !/<meta property="og:url" content="https:\/\/fichua\.co\/sample-lodge">/.test(samplePage)) {
    throw new Error('[prerender] Sample lodge page check failed')
  }
  console.log('[prerender] Fictional sample lodge page — checks passed.')

  const env = loadEnv()
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    console.warn('[prerender] Supabase env vars missing in .env -- skipping operator prerender.')
    return
  }

  let operators, rooms, reviews
  try {
    ;[operators, rooms, reviews] = await Promise.all([
      api(env, 'operators?select=*&status=eq.published'),
      api(env, 'room_types?select=operator_id,name,description,price_per_night,currency,max_guests&order=sort_order.asc'),
      api(env, 'reviews?select=operator_id,rating,moderation_status'),
    ])
  } catch (err) {
    console.warn('[prerender] Could not load data, skipping operator prerender:', err.message)
    return
  }

  if (!Array.isArray(operators) || operators.length === 0) {
    console.log('[prerender] No published operators -- nothing to prerender.')
    return
  }

  let written = 0
  for (const op of operators) {
    if (!op.slug) continue
    const opRooms = rooms.filter((r) => r.operator_id === op.id)
    const opReviews = reviews.filter((r) => r.operator_id === op.id)
    const dir = path.join(DIST, 'operators', op.slug)
    mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, 'index.html'), renderPage(shell, op, opRooms, opReviews))
    written++
    console.log(`[prerender] ${op.slug} — ${opRooms.length} room(s), ${opReviews.length} review(s)`)
  }

  console.log(`[prerender] Wrote ${written} operator page(s) to dist/operators/.`)
}

main()
