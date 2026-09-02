import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, Search, RefreshCw, Users, AlertCircle, X, Download, Key, CheckCircle2
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import {
  extractChannelIdentifier, isYouTubeChannelUrl,
  getChannelRssUrl, parseChannelNameFromRss, parseChannelRss,
  resolveChannelIdViaApi, fetchChannelVideosViaApi, hasYouTubeApiKey,
  filterOutShortsFromRss,
  type RssVideoEntry,
} from '../../lib/youtube'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const inputCls = 'w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#6c63ff]/50 focus:ring-1 focus:ring-[#6c63ff]/20 transition-all'

// ─── RSS fetch (no API key) ───────────────────────────────────────────────────
// Priority: Supabase Edge Function → Vite dev proxy → public proxies (raced)

const isDev = import.meta.env.DEV
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/fetch-channel-rss`

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

async function tryEdgeFunction(targetUrl: string): Promise<string> {
  const res = await fetch(`${EDGE_FN_URL}?url=${encodeURIComponent(targetUrl)}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) throw new Error(`edge ${res.status}`)
  const text = await res.text()
  if (!text || text.length < 100 || !text.includes('<')) throw new Error('edge empty')
  return text
}

async function tryDevProxy(targetUrl: string): Promise<string> {
  if (!isDev) throw new Error('not dev')
  const u = new URL(targetUrl)
  if (!u.hostname.includes('youtube.com')) throw new Error('not yt')
  const res = await fetch('/yt-rss' + u.search)
  if (!res.ok) throw new Error(`dev proxy ${res.status}`)
  const text = await res.text()
  if (!text || text.length < 100) throw new Error('dev proxy empty')
  return text
}

const PUBLIC_PROXIES = [
  (url: string) => fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`).then(r => { if (!r.ok) throw new Error(r.status.toString()); return r.text() }),
  (url: string) => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`).then(r => r.json()).then(d => { if (typeof d?.contents !== 'string') throw new Error('empty'); return d.contents as string }),
  (url: string) => fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`).then(r => { if (!r.ok) throw new Error(r.status.toString()); return r.text() }),
  (url: string) => fetch(`https://thingproxy.freeboard.io/fetch/${url}`).then(r => { if (!r.ok) throw new Error(r.status.toString()); return r.text() }),
]

async function fetchRss(targetUrl: string): Promise<string> {
  // 1. Supabase Edge Function
  try {
    return await withTimeout(tryEdgeFunction(targetUrl), 8000)
  } catch { /* fall through */ }

  // 2. Vite dev proxy (localhost only)
  if (isDev) {
    try {
      return await withTimeout(tryDevProxy(targetUrl), 5000)
    } catch { /* fall through */ }
  }

  // 3. Race all public proxies
  const race = PUBLIC_PROXIES.map(fn =>
    withTimeout(fn(targetUrl), 12000).then(text => {
      if (!text || text.length < 100 || !text.includes('<feed')) throw new Error('invalid')
      return text
    })
  )
  return Promise.any(race).catch(() => {
    throw new Error('RSS_BLOCKED')
  })
}

// ─── Resolve channel via API key (fast, reliable) ────────────────────────────
async function resolveViaApiKey(url: string, limit = 15): Promise<{ channelId: string; name: string; handle?: string; thumbnailUrl?: string; videos: RssVideoEntry[] }> {
  const info = extractChannelIdentifier(url)
  if (!info) throw new Error('Not a valid YouTube channel URL')

  // resolveChannelIdViaApi also fetches contentDetails so we get uploadsPlaylistId
  // in the same request — fetchChannelVideosViaApi reuses it to avoid a second lookup
  const channelInfo = await resolveChannelIdViaApi(info)
  const videos = await fetchChannelVideosViaApi(channelInfo.channelId, limit, channelInfo.uploadsPlaylistId)

  return {
    channelId: channelInfo.channelId,
    name: channelInfo.name,
    handle: channelInfo.handle,
    thumbnailUrl: channelInfo.thumbnailUrl,
    videos,
  }
}

// ─── Resolve channel via RSS (no API key) ────────────────────────────────────
async function resolveViaRss(url: string, limit = 15): Promise<{ channelId: string; name: string; videos: RssVideoEntry[] }> {
  const info = extractChannelIdentifier(url)
  if (!info) throw new Error('Not a valid YouTube channel URL')

  if (info.type === 'channelId') {
    const rssUrl = getChannelRssUrl(info.value)
    const xmlText = await fetchRss(rssUrl)
    if (!xmlText.includes('<feed')) throw new Error('Invalid RSS response.')
    const allVideos = parseChannelRss(xmlText)
    const videos = (await filterOutShortsFromRss(allVideos)).slice(0, limit)
    return {
      channelId: info.value,
      name: parseChannelNameFromRss(xmlText) || 'YouTube Channel',
      videos,
    }
  }

  if (info.type === 'handle') {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?forHandle=@${info.value}`
    const xmlText = await fetchRss(rssUrl)
    if (xmlText.includes('<feed')) {
      const m = xmlText.match(/<yt:channelId>(UC[\w-]{22})<\/yt:channelId>/)
      const allVideos = parseChannelRss(xmlText)
      const videos = (await filterOutShortsFromRss(allVideos)).slice(0, limit)
      return {
        channelId: m ? m[1] : info.value,
        name: parseChannelNameFromRss(xmlText) || info.value,
        videos,
      }
    }
  }

  throw new Error('Could not resolve channel. Add a YouTube API key in .env for reliable fetching.')
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddChannelPage() {
  const { categories, addVideo, addChannel, updateChannel } = useStore()
  const navigate = useNavigate()
  const hasApiKey = hasYouTubeApiKey()

  const [url, setUrl] = useState('')
  const [videoLimit, setVideoLimit] = useState(15)
  const [isCustomLimit, setIsCustomLimit] = useState(false)
  const [customLimitInput, setCustomLimitInput] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchStatus, setFetchStatus] = useState('')
  const [rssBlocked, setRssBlocked] = useState(false)

  const [channelData, setChannelData] = useState<{
    channelId: string
    name: string
    handle?: string
    thumbnailUrl?: string
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
      toast.error('Not a valid channel URL. Try youtube.com/@handle or youtube.com/channel/UCxxxxx')
      return
    }

    setFetching(true)
    setChannelData(null)
    setRssBlocked(false)
    setFetchStatus(hasApiKey ? 'Looking up channel…' : 'Fetching RSS feed…')

    try {
      let result: { channelId: string; name: string; handle?: string; thumbnailUrl?: string; videos: RssVideoEntry[] }

      if (hasApiKey) {
        result = await resolveViaApiKey(normalized, videoLimit)
      } else {
        result = await resolveViaRss(normalized, videoLimit)
      }

      if (result.videos.length === 0) throw new Error('No public videos found for this channel.')
      setChannelData(result)
      toast.success(`Found ${result.videos.length} videos from "${result.name}"`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch channel'
      if (msg === 'RSS_BLOCKED' || msg.includes('RSS')) {
        setRssBlocked(true)
      } else {
        toast.error(msg)
      }
    }

    setFetchStatus('')
    setFetching(false)
  }

  const handleReset = () => {
    setUrl(''); setChannelData(null); setImportProgress(0); setRssBlocked(false)
  }

  const handleImport = async () => {
    if (!channelData) return
    setSaving(true)
    setImportProgress(0)

    const selectedCat = categories.find(c => c.id === channelCategoryId)
    const now = new Date().toISOString()
    const normalized = url.trim().startsWith('http') ? url.trim() : 'https://' + url.trim()
    const info = extractChannelIdentifier(normalized)

    let savedChannel: import('../../types').Channel
    try {
      savedChannel = await addChannel({
        channel_id: channelData.channelId,
        name: channelData.name,
        handle: channelData.handle || (info?.type === 'handle' ? info.value : undefined),
        channel_url: normalized,
        thumbnail_url: channelData.thumbnailUrl || channelData.videos[0]?.thumbnailUrl,
        category_id: channelCategoryId || undefined,
        category: selectedCat,
        status: channelStatus,
        video_count: channelData.videos.length,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('addChannel error:', err)
      toast.error(`Failed to save channel: ${msg}`)
      setSaving(false)
      return
    }

    // Batch insert 5 at a time
    const BATCH = 5
    let imported = 0
    const total = channelData.videos.length

    for (let i = 0; i < total; i += BATCH) {
      const slice = channelData.videos.slice(i, i + BATCH)
      const results = await Promise.allSettled(
        slice.map(entry =>
          addVideo({
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
            duration: entry.duration,
            created_at: entry.publishedAt,
            updated_at: now,
          })
        )
      )
      imported += results.filter(r => r.status === 'fulfilled').length
      setImportProgress(Math.round(Math.min(i + BATCH, total) / total * 100))
    }

    try { await updateChannel(savedChannel.id, { video_count: imported }) } catch { /* ok */ }

    toast.success(`Imported ${imported} video${imported !== 1 ? 's' : ''} from "${channelData.name}"`)
    setSaving(false)
    navigate('/admin/channels')
  }

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Import Channel</h1>
        <p className="text-white/40 text-sm mt-1">Paste a YouTube channel link to import its latest videos.</p>
      </motion.div>

      {/* API key status banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className={`relative flex items-start gap-3 p-3.5 glass rounded-xl border mb-5 text-xs overflow-hidden ${
          hasApiKey ? 'border-emerald-500/20 text-emerald-400' : 'border-amber-500/20 text-amber-400'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        {hasApiKey
          ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          : <Key className="w-4 h-4 shrink-0 mt-0.5" />
        }
        <div>
          {hasApiKey ? (
            <p>YouTube API key detected — fast, reliable channel fetching enabled.</p>
          ) : (
            <>
              <p className="font-medium mb-0.5">No YouTube API key found</p>
              <p className="opacity-70">
                Add <code className="glass px-1 rounded">VITE_YOUTUBE_API_KEY</code> in your <code className="glass px-1 rounded">.env</code> for reliable fetching.{' '}
                <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">Get a free key →</a>
              </p>
            </>
          )}
        </div>
      </motion.div>

      {/* URL Input card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative glass rounded-2xl p-5 sm:p-6 mb-6 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        <label className="block text-sm font-semibold text-white/70 mb-3">Channel URL</label>

        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <span className="text-xs text-white/40 shrink-0">Videos to import:</span>
          <div className="flex gap-1.5 flex-wrap items-center">
            {[10, 15, 20, 30, 50].map(n => (
              <button
                key={n}
                onClick={() => { setVideoLimit(n); setIsCustomLimit(false); setCustomLimitInput('') }}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border transition-all ${
                  !isCustomLimit && videoLimit === n
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'glass text-white/40 border-white/10 hover:text-white/70 hover:border-white/20'
                }`}
              >
                {!isCustomLimit && videoLimit === n && <Users className="w-3 h-3" />}
                {n}
              </button>
            ))}
            {/* Custom option */}
            {!isCustomLimit ? (
              <button
                onClick={() => { setIsCustomLimit(true); setCustomLimitInput(String(videoLimit)) }}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full border transition-all glass text-white/40 border-white/10 hover:text-white/70 hover:border-white/20"
              >
                Custom
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={customLimitInput}
                  onChange={e => {
                    const raw = e.target.value
                    setCustomLimitInput(raw)
                    const n = parseInt(raw, 10)
                    if (!isNaN(n) && n >= 1) setVideoLimit(n)
                  }}
                  onBlur={() => {
                    const n = parseInt(customLimitInput, 10)
                    if (isNaN(n) || n < 1) { setCustomLimitInput(String(videoLimit)) }
                  }}
                  className="w-16 text-xs px-2 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/50 focus:outline-none focus:border-emerald-400/70 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoFocus
                />
                <button
                  onClick={() => { setIsCustomLimit(false); setCustomLimitInput('') }}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                  title="Cancel custom"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <span className="text-xs text-white/25 shrink-0">videos</span>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="url" value={url}
              onChange={e => { setUrl(e.target.value); if (channelData || rssBlocked) handleReset() }}
              onKeyDown={e => e.key === 'Enter' && !fetching && handleFetch()}
              placeholder="youtube.com/@handle  or  youtube.com/channel/UCxxxxx"
              className="w-full glass rounded-full pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleFetch} disabled={fetching || saving}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white text-[#080810] disabled:opacity-50 rounded-full text-sm font-semibold shadow-lg shadow-white/10 hover:bg-white/90 transition-all shrink-0"
          >
            {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">{fetching ? 'Fetching…' : 'Fetch'}</span>
          </motion.button>
        </div>

        {fetchStatus && (
          <p className="text-xs text-[#a78bfa]/80 mt-2.5 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin shrink-0" /> {fetchStatus}
          </p>
        )}
        <p className="text-xs text-white/20 mt-2.5">
          Supports: youtube.com/@handle · youtube.com/channel/UCxxxxx · youtube.com/c/name
        </p>
      </motion.div>

      {/* RSS blocked */}
      <AnimatePresence>
        {rssBlocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative mb-6 glass rounded-2xl p-5 space-y-4 border border-red-500/20 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/20 to-transparent pointer-events-none" />
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">Channel fetch blocked</p>
                <p className="text-xs text-white/40">YouTube is blocking CORS proxies. Fix it with one of these options:</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  n: '1',
                  title: 'Add a YouTube API key (recommended)',
                  body: <>Add <code className="glass px-1 rounded">VITE_YOUTUBE_API_KEY=AIza…</code> to <code className="glass px-1 rounded">.env</code> then restart.{' '}<a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] underline">Get free key</a></>,
                },
                {
                  n: '2',
                  title: 'Deploy the Supabase Edge Function',
                  body: <>Run <code className="glass px-1 rounded">supabase functions deploy fetch-channel-rss</code> — fetches RSS server-side.</>,
                },
                {
                  n: '3',
                  title: 'Use a direct channel ID URL',
                  body: <>Paste <code className="glass px-1 rounded">youtube.com/channel/UCxxxxx</code> format — more reliable than @handle.</>,
                },
              ].map(item => (
                <div key={item.n} className="flex items-start gap-3 p-3 glass rounded-xl">
                  <span className="text-xs font-bold text-[#a78bfa] glass px-2 py-0.5 rounded shrink-0 mt-0.5 border border-[#6c63ff]/25">{item.n}</span>
                  <div>
                    <p className="text-xs font-semibold text-white/80 mb-0.5">{item.title}</p>
                    <p className="text-xs text-white/40">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channel result + settings */}
      <AnimatePresence>
        {channelData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Channel card */}
            <div className="relative glass rounded-2xl p-5 sm:p-6 border border-emerald-500/20 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none" />
              <div className="flex items-start gap-4">
                {channelData.thumbnailUrl ? (
                  <img src={channelData.thumbnailUrl} alt={channelData.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/[0.08]" />
                ) : (
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff] to-[#a78bfa]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <Users className="absolute inset-0 m-auto w-7 h-7 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-white">{channelData.name}</h2>
                    <span className="text-xs glass text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25">
                      {channelData.videos.length} videos ready
                    </span>
                  </div>
                  {channelData.handle && <p className="text-xs text-white/35 mt-0.5">{channelData.handle}</p>}
                  <p className="text-xs text-white/20 font-mono truncate mt-0.5">{channelData.channelId}</p>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {channelData.videos.slice(0, 6).map(v => (
                      <img key={v.videoId} src={v.thumbnailUrl} alt={v.title}
                        className="w-14 h-9 object-cover rounded-lg opacity-75 border border-white/[0.07]"
                        onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg` }} />
                    ))}
                    {channelData.videos.length > 6 && (
                      <div className="w-14 h-9 rounded-lg glass flex items-center justify-center text-xs text-white/30">
                        +{channelData.videos.length - 6}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={handleReset} className="p-1.5 text-white/25 hover:text-white transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="relative glass rounded-2xl p-5 sm:p-6 space-y-4 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              <h3 className="font-semibold text-white text-sm">Import Settings</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/50 mb-2">Category</label>
                  <select value={channelCategoryId} onChange={e => setChannelCategoryId(e.target.value)} className={inputCls}>
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-2">Visibility</label>
                  <select value={channelStatus} onChange={e => setChannelStatus(e.target.value as 'published' | 'draft')} className={inputCls}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {saving && (
              <div className="relative glass rounded-xl p-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40">Saving to database…</span>
                  <span className="text-xs text-[#a78bfa]">{importProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
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
              whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={handleImport} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#080810] disabled:opacity-60 py-3.5 rounded-full font-semibold shadow-lg shadow-white/10 hover:bg-white/90 transition-all text-sm"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-[#080810]/30 border-t-[#080810] rounded-full animate-spin" /> Importing {channelData.videos.length} videos…</>
              ) : (
                <><Download className="w-4 h-4" /> Import {channelData.videos.length} Videos</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
