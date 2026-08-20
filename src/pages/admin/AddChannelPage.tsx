import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, Search, RefreshCw, Users, AlertCircle, X, Download
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import {
  extractChannelIdentifier, isYouTubeChannelUrl,
  getChannelRssUrl, parseChannelNameFromRss, parseChannelRss,
  type RssVideoEntry
} from '../../lib/youtube'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import type { Channel } from '../../types'

const inputCls = 'w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/30 transition-all'

// ─── CORS proxies to try in order ────────────────────────────────────────────
// Each returns the raw text content of the target URL
const PROXY_FETCHERS: Array<(url: string) => Promise<string>> = [
  // corsproxy.io — returns raw content directly
  async (url) => {
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error(`corsproxy ${res.status}`)
    return res.text()
  },
  // allorigins — wraps in JSON { contents }
  async (url) => {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error(`allorigins ${res.status}`)
    const data = await res.json()
    if (typeof data?.contents !== 'string') throw new Error('allorigins empty')
    return data.contents
  },
  // codetabs — returns raw content
  async (url) => {
    const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error(`codetabs ${res.status}`)
    return res.text()
  },
]

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ])
}

async function fetchWithProxy(targetUrl: string): Promise<string> {
  for (const fetcher of PROXY_FETCHERS) {
    try {
      const text = await withTimeout(fetcher(targetUrl), 12000)
      if (text && text.length > 50) return text
    } catch {
      // try next proxy
    }
  }
  throw new Error('All proxies failed — check your internet connection and try again.')
}

// ─── Resolve channel ID + RSS from any channel URL ───────────────────────────
async function resolveChannel(url: string): Promise<{ channelId: string; name: string; xmlText: string }> {
  const info = extractChannelIdentifier(url)
  if (!info) throw new Error('Not a valid YouTube channel URL')

  // For direct channel IDs — fetch RSS straight away
  if (info.type === 'channelId') {
    const rssUrl = getChannelRssUrl(info.value)
    const xmlText = await fetchWithProxy(rssUrl)
    if (!xmlText.includes('<feed')) throw new Error('Invalid RSS response. Try again.')
    const name = parseChannelNameFromRss(xmlText) || 'YouTube Channel'
    return { channelId: info.value, name, xmlText }
  }

  // For @handle — try YouTube's forHandle RSS endpoint first (no HTML scraping needed)
  if (info.type === 'handle') {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?forHandle=@${info.value}`
    try {
      const xmlText = await fetchWithProxy(rssUrl)
      if (xmlText && xmlText.includes('<feed')) {
        const channelIdMatch = xmlText.match(/<yt:channelId>(UC[\w-]{22})<\/yt:channelId>/)
        const channelId = channelIdMatch ? channelIdMatch[1] : info.value
        const name = parseChannelNameFromRss(xmlText) || info.value
        return { channelId, name, xmlText }
      }
    } catch {
      // fall through to HTML scrape
    }
  }

  // Fallback: scrape channel page HTML to extract the UCxxx channel ID
  const channelPageUrl = url.startsWith('http') ? url : `https://www.youtube.com/${url}`
  const html = await fetchWithProxy(channelPageUrl)

  const match =
    html.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/) ||
    html.match(/channel\/(UC[\w-]{22})/) ||
    html.match(/"externalId"\s*:\s*"(UC[\w-]{22})"/)

  if (!match) throw new Error('Could not extract channel ID. Try pasting the direct youtube.com/channel/UCxxxxx URL.')

  const channelId = match[1]
  const rssUrl = getChannelRssUrl(channelId)
  const xmlText = await fetchWithProxy(rssUrl)
  const name = parseChannelNameFromRss(xmlText) || 'YouTube Channel'
  return { channelId, name, xmlText }
}

export default function AddChannelPage() {
  const { categories, addVideo, addChannel } = useStore()
  const navigate = useNavigate()

  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [channelData, setChannelData] = useState<{
    channelId: string
    name: string
    videos: RssVideoEntry[]
  } | null>(null)

  const [channelCategoryId, setChannelCategoryId] = useState('')
  const [channelStatus, setChannelStatus] = useState<'published' | 'draft'>('published')
  const [saving, setSaving] = useState(false)
  const [importProgress, setImportProgress] = useState(0)

  const handleFetch = async () => {
    const trimmed = url.trim()
    if (!trimmed) { toast.error('Enter a YouTube channel URL'); return }

    const normalized = trimmed.startsWith('http') ? trimmed : 'https://' + trimmed

    if (!isYouTubeChannelUrl(normalized)) {
      toast.error('Not a valid channel URL. Try youtube.com/@handle or youtube.com/channel/UC...')
      return
    }
    setFetching(true)
    setChannelData(null)
    try {
      const { channelId, name, xmlText } = await resolveChannel(normalized)
      const videos = parseChannelRss(xmlText)
      if (videos.length === 0) throw new Error('No public videos found for this channel.')
      setChannelData({ channelId, name, videos })
      toast.success(`Found ${videos.length} videos from "${name}" — ready to import!`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch channel')
    }
    setFetching(false)
  }

  const handleReset = () => {
    setUrl(''); setChannelData(null); setImportProgress(0)
  }

  const handleImport = async () => {
    if (!channelData) return
    setSaving(true)
    setImportProgress(0)

    const selectedCat = categories.find(c => c.id === channelCategoryId)
    const now = new Date().toISOString()
    const normalized = url.trim().startsWith('http') ? url.trim() : 'https://' + url.trim()
    const info = extractChannelIdentifier(normalized)

    // Save channel record
    const channel: Channel = {
      id: Date.now().toString(),
      channel_id: channelData.channelId,
      name: channelData.name,
      handle: info?.type === 'handle' ? info.value : undefined,
      channel_url: normalized,
      thumbnail_url: channelData.videos[0]?.thumbnailUrl,
      category_id: channelCategoryId || undefined,
      category: selectedCat,
      status: channelStatus,
      video_count: channelData.videos.length,
      created_at: now,
      updated_at: now,
    }
    addChannel(channel)

    // Import ALL videos
    let imported = 0
    for (let i = 0; i < channelData.videos.length; i++) {
      const entry = channelData.videos[i]
      try {
        await addVideo({
          youtube_url: `https://www.youtube.com/watch?v=${entry.videoId}`,
          youtube_video_id: entry.videoId,
          title: entry.title,
          description: entry.description,
          thumbnail_url: entry.thumbnailUrl,
          category_id: channelCategoryId || undefined,
          category: selectedCat,
          channel_id: channelData.channelId,
          status: channelStatus,
          is_featured: false,
          views: parseInt(entry.viewCount || '0') || 0,
          tags: [],
          created_at: entry.publishedAt,
          updated_at: now,
        })
        imported++
      } catch {
        // continue on individual failure
      }
      setImportProgress(Math.round(((i + 1) / channelData.videos.length) * 100))
    }

    toast.success(`Imported ${imported} videos from "${channelData.name}"!`)
    setSaving(false)
    navigate('/admin/channels')
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Import Channel</h1>
        <p className="text-gray-500 text-sm mt-1">Paste a YouTube channel link — all videos will be imported automatically.</p>
      </motion.div>

      {/* URL Input */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6 mb-6"
      >
        <label className="block text-sm font-semibold text-gray-300 mb-3">Channel URL</label>

        <div className="flex gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
            <Users className="w-3 h-3" /> All videos auto-imported
          </span>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); if (channelData) handleReset() }}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="youtube.com/@channelname  or  youtube.com/channel/UCxxxxx"
              className="w-full bg-[#16161e] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#6c63ff]/50 focus:ring-1 focus:ring-[#6c63ff]/20 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleFetch} disabled={fetching || saving}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#6c63ff] to-[#5b53ee] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-[#6c63ff]/20 shrink-0"
          >
            {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">{fetching ? 'Fetching...' : 'Fetch'}</span>
          </motion.button>
        </div>

        <p className="text-xs text-gray-700 mt-2.5">
          Supports: youtube.com/@handle · youtube.com/channel/UCxxxxx · youtube.com/c/name
          <br />
          <span className="text-amber-600/80">Tip: If @handle fails, use the youtube.com/channel/UC… URL directly.</span>
        </p>
      </motion.div>

      {/* Channel result + settings */}
      <AnimatePresence>
        {channelData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Channel card */}
            <div className="bg-[#0d0d14] border border-emerald-500/20 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center shrink-0 shadow-lg shadow-[#6c63ff]/20">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white">{channelData.name}</h2>
                    <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {channelData.videos.length} videos ready
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">{channelData.channelId}</p>

                  {/* Video thumbnails preview */}
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {channelData.videos.slice(0, 6).map(v => (
                      <img
                        key={v.videoId}
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="w-14 h-9 object-cover rounded-md opacity-80"
                        onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg` }}
                      />
                    ))}
                    {channelData.videos.length > 6 && (
                      <div className="w-14 h-9 rounded-md bg-[#16161e] border border-[#2a2a3a] flex items-center justify-center text-xs text-gray-500">
                        +{channelData.videos.length - 6}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={handleReset} className="p-1.5 text-gray-600 hover:text-white transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="font-semibold text-white text-sm">Import Settings</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select value={channelCategoryId} onChange={e => setChannelCategoryId(e.target.value)} className={inputCls}>
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Visibility</label>
                  <select value={channelStatus} onChange={e => setChannelStatus(e.target.value as 'published' | 'draft')} className={inputCls}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="flex items-start gap-2.5 p-4 bg-amber-500/8 border border-amber-500/15 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Fetched from YouTube's public RSS feed — returns the ~15 most recent public videos. All {channelData.videos.length} will be imported.
              </p>
            </div>

            {/* Progress bar while importing */}
            {saving && (
              <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Importing videos...</span>
                  <span className="text-xs text-[#a78bfa]">{importProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#6c63ff] to-[#a78bfa] rounded-full"
                    animate={{ width: `${importProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Import button */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleImport}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all shadow-md shadow-emerald-600/20 text-sm"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing {channelData.videos.length} videos...</>
              ) : (
                <><Download className="w-4 h-4" /> Import All {channelData.videos.length} Videos</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
