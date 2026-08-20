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

/**
 * Detects whether a URL is a YouTube channel/user link and extracts the
 * channel handle or ID.
 *
 * Supported formats:
 *   https://www.youtube.com/@handle
 *   https://www.youtube.com/channel/UCxxxxxxx
 *   https://www.youtube.com/c/CustomName
 *   https://www.youtube.com/user/Username
 */
export function extractChannelIdentifier(url: string): {
  type: 'handle' | 'channelId' | 'custom' | 'user'
  value: string
} | null {
  if (!url) return null
  try {
    // Normalize: add https:// if missing
    let normalized = url.trim()
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized
    }
    const u = new URL(normalized)
    const path = u.pathname

    // @handle  →  youtube.com/@handle
    const handleMatch = path.match(/^\/@([\w.-]+)/)
    if (handleMatch) return { type: 'handle', value: handleMatch[1] }

    // channel/UCxxxxx
    const channelMatch = path.match(/^\/channel\/(UC[\w-]{22})/)
    if (channelMatch) return { type: 'channelId', value: channelMatch[1] }

    // /c/CustomName
    const customMatch = path.match(/^\/c\/([\w.-]+)/)
    if (customMatch) return { type: 'custom', value: customMatch[1] }

    // /user/Username
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

/**
 * Build the YouTube RSS feed URL for a channel.
 * Works for channel IDs (UCxxx) without an API key.
 * For handles/@custom/user we use a CORS proxy to resolve them first.
 */
export function getChannelRssUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
}

/**
 * Parse a YouTube RSS feed XML string into a list of video entries.
 */
export interface RssVideoEntry {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string
  viewCount?: string
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

/**
 * Fetch channel videos via a public CORS proxy → YouTube RSS feed.
 * No API key required. Returns up to ~15 most recent videos.
 */
export async function fetchChannelVideosViaRss(channelId: string): Promise<RssVideoEntry[]> {
  const rssUrl = getChannelRssUrl(channelId)
  // Use allorigins as a CORS proxy (public, free)
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`
  const res = await fetch(proxyUrl)
  if (!res.ok) throw new Error('Failed to fetch channel feed')
  const data = await res.json()
  return parseChannelRss(data.contents as string)
}

/**
 * Extract channel name from RSS XML
 */
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
