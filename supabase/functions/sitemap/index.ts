import { createClient } from 'npm:@supabase/supabase-js@2'

// Dynamic sitemap.xml — includes every published operator, regenerated on
// every request so a newly published listing appears without a manual
// rebuild. Public, unauthenticated (search engine crawlers don't carry a
// Supabase session).
//
// NOTE: this serves XML at the function's own URL, not at the canonical
// https://fichua.co/sitemap.xml path. Getting it to answer at that exact
// path requires a hosting-level rewrite rule pointing /sitemap.xml at this
// function — worth confirming with Lovable whether that's configurable.
// In the meantime this function's direct URL can be submitted to Google
// Search Console / Bing Webmaster Tools as-is; both accept a sitemap at
// any URL, it doesn't have to be /sitemap.xml.

const SITE_URL = 'https://fichua.co'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return new Response('Server configuration error', { status: 500, headers: corsHeaders })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: operators, error } = await supabase
    .from('operators')
    .select('slug, updated_at')
    .eq('status', 'published')

  if (error) {
    console.error('Failed to load operators for sitemap', { error })
    return new Response('Failed to generate sitemap', { status: 500, headers: corsHeaders })
  }

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    { loc: `${SITE_URL}/discover`, priority: '0.9' },
    { loc: `${SITE_URL}/trust`, priority: '0.8' },
  ]

  const operatorUrls = (operators ?? []).map((op) => ({
    loc: `${SITE_URL}/operators/${op.slug}`,
    lastmod: op.updated_at ? new Date(op.updated_at).toISOString().split('T')[0] : undefined,
    priority: '0.8',
  }))

  const allUrls = [...staticUrls, ...operatorUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${'lastmod' in u && u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

  return new Response(xml, {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
  })
})
