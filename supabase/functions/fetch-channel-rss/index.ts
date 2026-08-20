// Supabase Edge Function — fetch-channel-rss
// Runs server-side (Deno), so no CORS issues fetching YouTube RSS.
// The browser calls this function; this function calls YouTube.
//
// Deploy:  supabase functions deploy fetch-channel-rss
// Local:   supabase functions serve fetch-channel-rss

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const url = new URL(req.url)

  // Accept either ?channel_id=UCxxx  or  ?handle=@handle  or  ?url=<full rss url>
  const channelId = url.searchParams.get('channel_id')
  const handle    = url.searchParams.get('handle')
  const rawUrl    = url.searchParams.get('url')

  let rssUrl: string

  if (rawUrl) {
    // Validate it's a YouTube URL to prevent SSRF
    const parsed = new URL(rawUrl)
    if (!parsed.hostname.endsWith('youtube.com')) {
      return new Response(JSON.stringify({ error: 'Only youtube.com URLs allowed' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
    rssUrl = rawUrl
  } else if (channelId) {
    rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  } else if (handle) {
    const h = handle.startsWith('@') ? handle : `@${handle}`
    rssUrl = `https://www.youtube.com/feeds/videos.xml?forHandle=${h}`
  } else {
    return new Response(JSON.stringify({ error: 'Provide channel_id, handle, or url param' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const res = await fetch(rssUrl, {
      headers: {
        // Mimic a real browser to avoid YouTube blocking the fetch
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    })

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `YouTube returned ${res.status}` }),
        { status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const xml = await res.text()
    return new Response(xml, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/xml; charset=utf-8',
        // Cache for 5 minutes — RSS doesn't update faster than that
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Fetch failed' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
