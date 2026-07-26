// Generates public/sitemap.xml as a plain static file before every build,
// so fichua.co/sitemap.xml is served the normal way Vite already serves
// public/llms.txt -- no hosting-level rewrite needed (Lovable confirmed
// those aren't available on this plan) and no TanStack Start server route
// needed (this project is on the classic Vite SPA stack, not TanStack
// Start, per Lovable support's Jul 26 2026 reply).
//
// Reads the public Supabase URL + anon/publishable key straight out of the
// committed .env file -- both are meant to be public (they're already
// baked into the client-side bundle), so this needs no secret and works
// identically locally and on Lovable's build server.
//
// Fails soft: if the Supabase fetch doesn't work for any reason (offline,
// env vars missing, API hiccup), this logs a warning and leaves any
// previously-generated sitemap.xml in place rather than breaking the build.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SITE_URL = 'https://fichua.co'
const OUTPUT_PATH = path.join(ROOT, 'public', 'sitemap.xml')

function loadEnv() {
  const envPath = path.join(ROOT, '.env')
  const env = {}
  if (!existsSync(envPath)) return env
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
    if (match) env[match[1]] = match[2]
  }
  return env
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildXml(operators) {
  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    { loc: `${SITE_URL}/discover`, priority: '0.9' },
  ]
  const operatorUrls = operators.map((op) => ({
    loc: `${SITE_URL}/operators/${op.slug}`,
    lastmod: op.updated_at ? new Date(op.updated_at).toISOString().split('T')[0] : undefined,
    priority: '0.8',
  }))
  const allUrls = [...staticUrls, ...operatorUrls]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`
}

async function main() {
  const env = loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL
  const anonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !anonKey) {
    console.warn('[generate-sitemap] VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY not found in .env -- skipping, leaving any existing public/sitemap.xml untouched.')
    return
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/operators?select=slug,updated_at&status=eq.published`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
    )
    if (!res.ok) {
      console.warn(`[generate-sitemap] Supabase returned ${res.status} -- skipping, leaving any existing public/sitemap.xml untouched.`)
      return
    }
    const operators = await res.json()
    writeFileSync(OUTPUT_PATH, buildXml(operators))
    console.log(`[generate-sitemap] Wrote public/sitemap.xml with ${operators.length} published operator(s).`)
  } catch (error) {
    console.warn('[generate-sitemap] Fetch failed -- skipping, leaving any existing public/sitemap.xml untouched.', error)
  }
}

main()
