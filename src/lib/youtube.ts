/**
 * Extracts the YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // raw video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function getEmbedUrl(videoId: string, options?: {
  autoplay?: boolean
  start?: number
  mute?: boolean
  controls?: boolean
  rel?: boolean
}): string {
  const params = new URLSearchParams()
  if (options?.autoplay) params.set('autoplay', '1')
  if (options?.start) params.set('start', String(options.start))
  if (options?.mute) params.set('mute', '1')
  if (options?.controls === false) params.set('controls', '0')
  if (options?.rel === false) params.set('rel', '0')
  params.set('enablejsapi', '1')
  params.set('origin', window.location.origin)

  const query = params.toString()
  return `https://www.youtube-nocookie.com/embed/${videoId}${query ? '?' + query : ''}`
}

export function getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null
}

export function getWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

// ─── Channel helpers ──────────────────────────────────────────────────────────

export function extractChannelIdentifier(url: string): {
  type: 'handle' | 'channelId' | 'custom' | 'user'
  value: string
} | null {
  if (!url) return null
  try {
    let normalized = url.trim()
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized
    }
    const u = new URL(normalized)
    const path = u.pathname

    const handleMatch = path.match(/^\/@([\w.-]+)/)
    if (handleMatch) return { type: 'handle', value: handleMatch[1] }

    const channelMatch = path.match(/^\/channel\/(UC[\w-]{22})/)
    if (channelMatch) return { type: 'channelId', value: channelMatch[1] }

    const customMatch = path.match(/^\/c\/([\w.-]+)/)
    if (customMatch) return { type: 'custom', value: customMatch[1] }

    const userMatch = path.match(/^\/user\/([\w.-]+)/)
    if (userMatch) return { type: 'user', value: userMatch[1] }
  } catch {
    // not a valid URL
  }
  return null
}

export function isYouTubeChannelUrl(url: string): boolean {
  return extractChannelIdentifier(url) !== null
}

export function getChannelRssUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
}

// ─── Duration helpers ────────────────────────────────────────────────────────

/**
 * Parse an ISO 8601 duration string (e.g. PT1M30S) into total seconds.
 */
function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] ?? '0') * 3600) + (parseInt(m[2] ?? '0') * 60) + parseInt(m[3] ?? '0')
}

/**
 * Converts total seconds → "H:MM:SS" or "MM:SS".
 * e.g. 3661 → "1:01:01", 90 → "1:30"
 */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return ''
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/**
 * Converts ISO 8601 duration string (PT1H2M3S) → "H:MM:SS" or "MM:SS".
 */
export function formatIsoDuration(iso: string): string {
  return formatDuration(parseIsoDuration(iso))
}

// ─── RSS parsing ──────────────────────────────────────────────────────────────

export interface RssVideoEntry {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string
  viewCount?: string
  duration?: string   // formatted as "H:MM:SS" or "MM:SS"
}

export function parseChannelRss(xmlText: string): RssVideoEntry[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'application/xml')
  const entries = Array.from(doc.querySelectorAll('entry'))

  return entries.map((entry) => {
    const videoId = entry.querySelector('videoId')?.textContent
      || entry.querySelector('id')?.textContent?.replace('yt:video:', '') || ''
    const title = entry.querySelector('title')?.textContent || ''
    const description = entry.querySelector('group > description')?.textContent
      || entry.querySelector('description')?.textContent || ''
    const thumbnailUrl = entry.querySelector('group > thumbnail')?.getAttribute('url')
      || getThumbnailUrl(videoId, 'high')
    const publishedAt = entry.querySelector('published')?.textContent || new Date().toISOString()
    const viewCount = entry.querySelector('statistics')?.getAttribute('views') || undefined

    return { videoId, title, description, thumbnailUrl, publishedAt, viewCount }
  })
}

export function parseChannelNameFromRss(xmlText: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'application/xml')
  return doc.querySelector('author > name')?.textContent
    || doc.querySelector('title')?.textContent
    || 'YouTube Channel'
}

export function parseChannelIdFromRss(xmlText: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'application/xml')
  return doc.querySelector('channelId')?.textContent || ''
}

// ─── YouTube Data API v3 (browser-safe, proper CORS) ─────────────────────────

const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined
const YT_API = 'https://www.googleapis.com/youtube/v3'

export interface YoutubeChannelInfo {
  channelId: string
  name: string
  handle?: string
  thumbnailUrl?: string
  description?: string
  subscriberCount?: string
  videoCount?: string
  uploadsPlaylistId?: string
}

/**
 * Resolve a channel ID from a @handle or custom/user name via YouTube Data API.
 * Requires VITE_YOUTUBE_API_KEY.
 */
export async function resolveChannelIdViaApi(identifier: {
  type: 'handle' | 'channelId' | 'custom' | 'user'
  value: string
}): Promise<YoutubeChannelInfo> {
  if (!YT_API_KEY) throw new Error('NO_API_KEY')

  let apiUrl: string

  if (identifier.type === 'channelId') {
    apiUrl = `${YT_API}/channels?part=snippet,statistics,contentDetails&id=${identifier.value}&key=${YT_API_KEY}`
  } else if (identifier.type === 'handle') {
    apiUrl = `${YT_API}/channels?part=snippet,statistics,contentDetails&forHandle=@${identifier.value}&key=${YT_API_KEY}`
  } else {
    // custom / user — try forUsername (works for legacy channels)
    apiUrl = `${YT_API}/channels?part=snippet,statistics,contentDetails&forUsername=${identifier.value}&key=${YT_API_KEY}`
  }

  const res = await fetch(apiUrl)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message || `YouTube API ${res.status}`)
  }
  const data = await res.json() as { items?: Array<Record<string, unknown>> }
  const item = data?.items?.[0]
  if (!item) throw new Error('Channel not found. Make sure the URL is correct.')

  const snippet = item.snippet as Record<string, unknown>
  const statistics = item.statistics as Record<string, unknown>
  const contentDetails = item.contentDetails as Record<string, unknown>
  const thumbnails = snippet?.thumbnails as Record<string, Record<string, unknown>>
  const uploadsPlaylistId = (contentDetails?.relatedPlaylists as Record<string, unknown>)?.uploads as string

  return {
    channelId: item.id as string,
    name: snippet?.title as string || 'YouTube Channel',
    handle: snippet?.customUrl as string,
    thumbnailUrl: thumbnails?.high?.url as string || thumbnails?.default?.url as string,
    description: snippet?.description as string,
    subscriberCount: statistics?.subscriberCount as string,
    videoCount: statistics?.videoCount as string,
    uploadsPlaylistId,
  }
}

/**
 * Given a list of video IDs, return only the ones that:
 *  - have duration > 60s (not a Short)
 *  - have embeddable = true
 * Batches into groups of 50 (API limit).
 * Uses a single API call per batch (contentDetails + status parts).
 * Also returns a duration map (videoId → formatted duration string).
 */
async function filterVideos(videoIds: string[]): Promise<{ valid: Set<string>; durations: Map<string, string> }> {
  if (!YT_API_KEY || videoIds.length === 0) {
    return { valid: new Set(videoIds), durations: new Map() }
  }

  const valid = new Set<string>()
  const durations = new Map<string, string>()

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const res = await fetch(
      `${YT_API}/videos?part=contentDetails,status&id=${batch.join(',')}&key=${YT_API_KEY}`
    )
    if (!res.ok) {
      // On error, assume all are valid rather than blocking the import
      batch.forEach(id => valid.add(id))
      continue
    }
    const data = await res.json() as { items?: Array<Record<string, unknown>> }
    for (const item of data.items ?? []) {
      const isoStr = (item.contentDetails as Record<string, unknown>)?.duration as string ?? ''
      const seconds = parseIsoDuration(isoStr)
      const embeddable = (item.status as Record<string, unknown>)?.embeddable
      if (seconds > 60 && embeddable !== false) {
        const id = item.id as string
        valid.add(id)
        const fmt = formatDuration(seconds)
        if (fmt) durations.set(id, fmt)
      }
    }
  }
  return { valid, durations }
}

/**
 * @deprecated Use filterVideos instead (checks both duration and embeddability).
 * Kept for backward compatibility with filterOutShortsFromRss.
 */
async function filterOutShorts(videoIds: string[]): Promise<{ valid: Set<string>; durations: Map<string, string> }> {
  return filterVideos(videoIds)
}

/**
 * Fetch latest non-Shorts videos for a channel via YouTube Data API.
 * Uses the uploads playlist (cheap quota) then checks durations to skip Shorts.
 * Keeps paginating until `maxResults` non-Short videos are collected.
 * Pass uploadsPlaylistId to skip the extra channels lookup.
 * Requires VITE_YOUTUBE_API_KEY.
 */
export async function fetchChannelVideosViaApi(channelId: string, maxResults = 15, uploadsPlaylistId?: string): Promise<RssVideoEntry[]> {
  if (!YT_API_KEY) throw new Error('NO_API_KEY')

  // Step 1: get the uploads playlist ID if not provided
  let playlistId = uploadsPlaylistId
  if (!playlistId) {
    const channelRes = await fetch(
      `${YT_API}/channels?part=contentDetails&id=${channelId}&key=${YT_API_KEY}`
    )
    if (!channelRes.ok) throw new Error(`YouTube API ${channelRes.status}`)
    const channelData = await channelRes.json() as { items?: Array<Record<string, unknown>> }
    playlistId = (
      (channelData.items?.[0]?.contentDetails as Record<string, unknown>)
        ?.relatedPlaylists as Record<string, unknown>
    )?.uploads as string
  }

  if (!playlistId) throw new Error('Could not find channel uploads playlist.')

  // Step 2: page through playlist until we have `maxResults` non-Short videos
  const collected: RssVideoEntry[] = []
  let pageToken: string | undefined = undefined
  const MAX_PAGES = 5 // safety cap — avoid infinite loops

  for (let page = 0; page < MAX_PAGES && collected.length < maxResults; page++) {
    // Fetch a page of playlist items (fetch extra to account for shorts we'll drop)
    const fetchCount = Math.min(50, (maxResults - collected.length) * 3)
    const pageParam = pageToken ? `&pageToken=${pageToken}` : ''
    const playlistRes = await fetch(
      `${YT_API}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${fetchCount}&key=${YT_API_KEY}${pageParam}`
    )
    if (!playlistRes.ok) {
      const err = await playlistRes.json().catch(() => ({}))
      throw new Error((err as { error?: { message?: string } })?.error?.message || `YouTube API ${playlistRes.status}`)
    }
    const playlistData = await playlistRes.json() as {
      items?: Array<Record<string, unknown>>
      nextPageToken?: string
    }
    const items = playlistData?.items ?? []
    pageToken = playlistData.nextPageToken

    // Build candidate entries from this page
    const candidates: RssVideoEntry[] = (items
      .map((item): RssVideoEntry | null => {
        const snippet = item.snippet as Record<string, unknown>
        const contentDetails = item.contentDetails as Record<string, unknown>
        const videoId = (contentDetails?.videoId as string)
          || ((snippet?.resourceId as Record<string, unknown>)?.videoId as string)
          || ''
        if (!videoId) return null
        const thumbnails = snippet?.thumbnails as Record<string, Record<string, unknown>>
        const thumb = thumbnails?.high || thumbnails?.medium || thumbnails?.default
        const publishedAt = (snippet?.videoPublishedAt as string)
          || (snippet?.publishedAt as string)
          || new Date().toISOString()
        return {
          videoId,
          title: (snippet?.title as string) || '',
          description: (snippet?.description as string) || '',
          thumbnailUrl: (thumb?.url as string) || getThumbnailUrl(videoId, 'high'),
          publishedAt,
          viewCount: undefined,
          duration: undefined,
        }
      })
      .filter((v): v is RssVideoEntry => v !== null && v.videoId !== ''))

    if (candidates.length === 0) break

    // Step 3: filter out Shorts by checking durations
    const ids = candidates.map(v => v.videoId)
    const { valid: notShorts, durations } = await filterOutShorts(ids)
    const nonShortCandidates = candidates
      .filter(v => notShorts.has(v.videoId))
      .map(v => ({ ...v, duration: durations.get(v.videoId) }))

    const needed = maxResults - collected.length
    collected.push(...nonShortCandidates.slice(0, needed))

    // No more pages
    if (!pageToken) break
  }

  return collected
}

/**
 * Given a list of RSS video entries, return only non-Shorts that allow embedding.
 * - With API key: checks duration (> 60s) AND embeddable flag via YouTube Data API,
 *   and attaches the formatted duration string to each entry.
 * - Without API key: falls back to title-based heuristics for Shorts only
 *   (cannot detect embedding restrictions without the API).
 */
export async function filterOutShortsFromRss(entries: RssVideoEntry[]): Promise<RssVideoEntry[]> {
  if (entries.length === 0) return entries

  if (YT_API_KEY) {
    const ids = entries.map(e => e.videoId)
    const { valid, durations } = await filterVideos(ids)
    return entries
      .filter(e => valid.has(e.videoId))
      .map(e => ({ ...e, duration: durations.get(e.videoId) ?? e.duration }))
  }

  // No API key — filter by title heuristics (Shorts only; can't detect embedding blocks)
  const shortsPattern = /#shorts?\b/i
  return entries.filter(e => !shortsPattern.test(e.title) && !shortsPattern.test(e.description))
}

export function hasYouTubeApiKey(): boolean {
  return Boolean(YT_API_KEY && YT_API_KEY.length > 10 && YT_API_KEY !== 'your-youtube-api-key-here')
}
