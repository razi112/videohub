import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, Search, RefreshCw, Users, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, X, Download
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import {
  extractChannelIdentifier, isYouTubeChannelUrl,
  getChannelRssUrl, parseChannelNameFromRss, parseChannelRss,
  getThumbnailUrl, type RssVideoEntry
} from '../../lib/youtube'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import type { Channel } from '../../types'

const inputCls = 'w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/30 transition-all'

// ─── Resolve channel ID + RSS from any channel URL ───────────────────────────
async function resolveChannel(url: string): Promise<{ channelId: string; name: string; xmlText: string }> {
  const info = extractChannelIdentifier(url)
  if (!info) throw new Error('Not a valid YouTube channel URL')

  if (info.type === 'channelId') {
    const rssUrl = getChannelRssUrl(info.value)
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`
    const res = await fetch(proxy)
    if (!res.ok) throw new Error('Could not fetch channel feed')
    const data = await res.json()
    const xmlText = data.contents as string
    const name = parseChannelNameFromRss(xmlText) || 'YouTube Channel'
    return { channelId: info.value, name, xmlText }
  }

  // For @handle / /c/ / /user/ — scrape the channel page to extract channel ID
  const channelPageUrl = url.startsWith('http') ? url : `https://www.youtube.com/${url}`
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(channelPageUrl)}`
  const res = await fetch(proxy)
  if (!res.ok) throw new Error('Could not fetch channel page')
  const data = await res.json()
  const html: string = data.contents
  const match = html.match(/"channelId":"(UC[\w-]{22})"/) || html.match(/channel\/(UC[\w-]{22})/)
  if (!match) throw new Error('Could not extract channel ID. The channel may have privacy restrictions.')

  const channelId = match[1]
  const rssUrl = getChannelRssUrl(channelId)
  const rssProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`
  const rssRes = await fetch(rssProxy)
  if (!rssRes.ok) throw new Error('Could not fetch channel RSS feed')
  const rssData = await rssRes.json()
  const xmlText = rssData.contents as string
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
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set())
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleFetch = async () => {
    const trimmed = url.trim()
    if (!trimmed) { toast.error('Enter a YouTube channel URL'); return }
    if (!isYouTubeChannelUrl(trimmed)) {
      toast.error('Not a valid channel URL. Try youtube.com/@handle or youtube.com/channel/UC...')
      return
    }
    setFetching(true)
    try {
      const { channelId, name, xmlText } = await resolveChannel(trimmed)
      const videos = parseChannelRss(xmlText)
      if (videos.length === 0) throw new Error('No public videos found for this channel.')
      setChannelData({ channelId, name, videos })
      setSelectedVideoIds(new Set(videos.map(v => v.videoId)))
      toast.success(`Found ${videos.length} videos from "${name}"`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch channel')
    }
    setFetching(false)
  }

  const handleReset = () => {
    setUrl(''); setChannelData(null); setSelectedVideoIds(new Set())
  }

  const toggleSelect = (id: string) => {
    setSelectedVideoIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleImport = async () => {
    if (!channelData) return
    if (selectedVideoIds.size === 0) { toast.error('Select at least one video'); return }
    setSaving(true)

    const selectedCat = categories.find(c => c.id === channelCategoryId)
    const now = new Date().toISOString()
    const info = extractChannelIdentifier(url.trim())

    const channel: Channel = {
      id: Date.now().toString(),
      channel_id: channelData.channelId,
      name: channelData.name,
      handle: info?.type === 'handle' ? info.value : undefined,
      channel_url: url.trim(),
      thumbnail_url: channelData.videos[0]?.thumbnailUrl,
      category_id: channelCategoryId || undefined,
      category: selectedCat,
      status: channelStatus,
      video_count: selectedVideoIds.size,
      created_at: now,
      updated_at: now,
    }
    addChannel(channel)

    const selected = channelData.videos.filter(v => selectedVideoIds.has(v.videoId))
    for (let i = 0; i < selected.length; i++) {
      const entry = selected[i]
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
      } catch {
        // continue on individual failure
      }
    }

    toast.success(`Imported ${selected.length} videos from "${channelData.name}"!`)
    setSaving(false)
    navigate('/admin/channels')
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Import Channel</h1>
        <p className="text-gray-500 text-sm mt-1">Paste a YouTube channel link to import its videos.</p>
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
            <Users className="w-3 h-3" /> Channel import
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
              placeholder="https://youtube.com/@channelname"
              className="w-full bg-[#16161e] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#6c63ff]/50 focus:ring-1 focus:ring-[#6c63ff]/20 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleFetch} disabled={fetching}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#6c63ff] to-[#5b53ee] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-[#6c63ff]/20 shrink-0"
          >
            {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">{fetching ? 'Fetching...' : 'Fetch'}</span>
          </motion.button>
        </div>

        <p className="text-xs text-gray-700 mt-2.5">
          Supports: youtube.com/@handle · youtube.com/channel/UCxxxxx · youtube.com/c/name
        </p>
      </motion.div>

      {/* Channel result */}
      <AnimatePresence>
        {channelData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {/* Channel header */}
            <div className="bg-[#0d0d14] border border-emerald-500/20 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center shrink-0 shadow-lg shadow-[#6c63ff]/20">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white">{channelData.name}</h2>
                    <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Channel</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 font-mono truncate">{channelData.channelId}</p>
                  <p className="text-xs text-gray-600 mt-1">{channelData.videos.length} recent videos found via RSS</p>
                </div>
                <button onClick={handleReset} className="p-1.5 text-gray-600 hover:text-white transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Import settings */}
            <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="font-semibold text-white text-sm">Import Settings</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Assign Category</label>
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

            {/* Video selection */}
            <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e]">
                <h3 className="font-semibold text-white text-sm">
                  Select Videos
                  <span className="ml-2 text-xs font-normal text-gray-500">{selectedVideoIds.size} / {channelData.videos.length} selected</span>
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedVideoIds(new Set(channelData.videos.map(v => v.videoId)))}
                    className="text-xs text-[#6c63ff] hover:text-[#a78bfa] transition-colors">All</button>
                  <span className="text-gray-700">·</span>
                  <button onClick={() => setSelectedVideoIds(new Set())}
                    className="text-xs text-gray-500 hover:text-white transition-colors">None</button>
                </div>
              </div>

              <div className="divide-y divide-[#1e1e2e] max-h-[480px] overflow-y-auto">
                {channelData.videos.map((entry, i) => {
                  const selected = selectedVideoIds.has(entry.videoId)
                  const expanded = expandedVideo === entry.videoId
                  return (
                    <motion.div
                      key={entry.videoId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`transition-colors ${selected ? 'bg-[#111118]' : 'hover:bg-[#0f0f18]'}`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => toggleSelect(entry.videoId)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            selected ? 'bg-[#6c63ff] border-[#6c63ff]' : 'border-[#2a2a3a] hover:border-[#6c63ff]/50'
                          }`}
                        >
                          {selected && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        <img
                          src={entry.thumbnailUrl}
                          alt={entry.title}
                          className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-lg shrink-0"
                          onError={e => { (e.target as HTMLImageElement).src = getThumbnailUrl(entry.videoId) }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-medium truncate transition-colors ${selected ? 'text-white' : 'text-gray-400'}`}>
                            {entry.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(entry.publishedAt).toLocaleDateString()}
                            {entry.viewCount && ` · ${parseInt(entry.viewCount).toLocaleString()} views`}
                          </p>
                        </div>
                        <button
                          onClick={() => setExpandedVideo(expanded ? null : entry.videoId)}
                          className="p-1 text-gray-600 hover:text-gray-400 transition-colors shrink-0"
                        >
                          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-3 text-xs text-gray-500 leading-relaxed line-clamp-3 ml-8">
                              {entry.description || 'No description available.'}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2.5 p-4 bg-amber-500/8 border border-amber-500/15 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Videos are fetched from YouTube's public RSS feed (no API key needed). Returns the ~15 most recent public videos.
              </p>
            </div>

            {/* Import button */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleImport}
              disabled={saving || selectedVideoIds.size === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all shadow-md shadow-emerald-600/20"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing...</>
              ) : (
                <><Download className="w-4 h-4" /> Import {selectedVideoIds.size} Video{selectedVideoIds.size !== 1 ? 's' : ''} from Channel</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
