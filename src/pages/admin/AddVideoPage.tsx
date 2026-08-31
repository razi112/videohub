import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Search, Eye, Save, RefreshCw, PlayCircle, Music, Zap } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { extractYouTubeVideoId, getEmbedUrl, getThumbnailUrl } from '../../lib/youtube'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const inputCls = 'w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#6c63ff]/50 focus:ring-1 focus:ring-[#6c63ff]/20 transition-all'

export default function AddVideoPage() {
  const { categories, addVideo } = useStore()
  const navigate = useNavigate()

  const [url, setUrl]             = useState('')
  const [videoId, setVideoId]     = useState('')
  const [fetching, setFetching]   = useState(false)
  const [fetched, setFetched]     = useState(false)
  const [title, setTitle]         = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId]   = useState('')
  const [tags, setTags]           = useState('')
  const [status, setStatus]       = useState<'published' | 'draft'>('published')
  const [isFeatured, setIsFeatured]   = useState(false)
  const [isSong, setIsSong]       = useState(false)
  const [isShort, setIsShort]     = useState(false)
  const [duration, setDuration]   = useState('')
  const [saving, setSaving]       = useState(false)

  const handleFetch = async () => {
    const trimmed = url.trim()
    if (!trimmed) { toast.error('Please enter a YouTube URL'); return }
    const id = extractYouTubeVideoId(trimmed)
    if (!id) { toast.error('Could not find a video ID in this URL'); return }
    setFetching(true)
    await new Promise(r => setTimeout(r, 400))
    setVideoId(id); setFetched(true); setFetching(false)
    toast.success('Video detected! Fill in the details below.')
  }

  const handleReset = () => {
    setUrl(''); setVideoId(''); setFetched(false); setTitle(''); setDescription('')
    setCategoryId(''); setTags(''); setStatus('published'); setIsFeatured(false); setIsSong(false); setIsShort(false); setDuration('')
  }

  const handleSave = async () => {
    if (!videoId) { toast.error('Fetch a video first'); return }
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const selectedCat = categories.find(c => c.id === categoryId)
      await addVideo({
        youtube_url: url,
        youtube_video_id: videoId,
        title: title.trim(),
        description: description.trim(),
        thumbnail_url: getThumbnailUrl(videoId, 'high'),
        category_id: categoryId || undefined,
        category: selectedCat,
        status,
        is_featured: isFeatured,
        is_short: isShort,
        views: 0,
        tags: (() => {
          const base = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
          return isSong && !base.includes('music') ? ['music', ...base] : base
        })(),
        duration: duration.trim() || undefined,
      })
      toast.success(`Video ${status === 'published' ? 'published' : 'saved as draft'}!`)
      navigate('/admin/videos')
    } catch {
      toast.error('Failed to save video. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Add Video</h1>
        <p className="text-white/40 text-sm mt-1">Paste a YouTube video link to get started.</p>
      </motion.div>

      {/* URL Input */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative glass rounded-2xl p-5 sm:p-6 mb-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        <label className="block text-sm font-semibold text-white/70 mb-3">YouTube URL</label>

        <div className="flex gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-xs glass text-[#a78bfa] px-3 py-1 rounded-full border border-[#6c63ff]/25">
            <PlayCircle className="w-3 h-3" /> Single video
          </span>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="url" value={url}
              onChange={e => { setUrl(e.target.value); if (fetched) handleReset() }}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full glass rounded-full pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-all"
            />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleFetch} disabled={fetching}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white text-[#080810] disabled:opacity-50 rounded-full text-sm font-semibold transition-all shadow-lg shadow-white/10 hover:bg-white/90 shrink-0">
            {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">{fetching ? 'Fetching…' : 'Fetch'}</span>
          </motion.button>
        </div>
        <p className="text-xs text-white/20 mt-2.5">
          Supports: youtube.com/watch?v= · youtu.be/ · youtube.com/shorts/
        </p>
      </motion.div>

      {/* Video form */}
      <AnimatePresence>
        {fetched && videoId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {/* Preview */}
            <div className="relative glass rounded-2xl p-5 sm:p-6 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                  <Eye className="w-4 h-4 text-[#a78bfa]" /> Video Preview
                </h3>
                <span className="text-xs glass text-[#a78bfa] px-2 py-1 rounded-full font-mono border border-[#6c63ff]/25">
                  {videoId}
                </span>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden border border-white/[0.08]">
                <iframe
                  src={getEmbedUrl(videoId, { rel: false })} title="Preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Form */}
            <div className="relative glass rounded-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              <h3 className="font-semibold text-white text-sm sm:text-base">Video Information</h3>

              <div>
                <label className="block text-sm text-white/50 mb-2">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Enter video title" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Enter video description..." rows={3}
                  className={`${inputCls} resize-none`} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/50 mb-2">Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-2">Duration (e.g. 12:34)</label>
                  <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
                    placeholder="12:34" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="physics, science, class10" className={inputCls} />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/50 mb-3">Visibility</label>
                  <div className="space-y-2">
                    {(['published', 'draft'] as const).map(s => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="vstatus" value={s} checked={status === s}
                          onChange={() => setStatus(s)} className="w-4 h-4 accent-[#6c63ff]" />
                        <span className="text-sm text-white/60 capitalize">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-3">Options</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-[#6c63ff]" />
                      <span className="text-sm text-white/60">Show on homepage hero</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isSong} onChange={e => setIsSong(e.target.checked)}
                        className="w-4 h-4 accent-[#a78bfa]" />
                      <span className="flex items-center gap-1.5 text-sm text-white/60">
                        <Music className={`w-3.5 h-3.5 transition-colors ${isSong ? 'text-[#a78bfa]' : 'text-white/25'}`} />
                        Music / Song
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isShort} onChange={e => setIsShort(e.target.checked)}
                        className="w-4 h-4 accent-[#f59e0b]" />
                      <span className="flex items-center gap-1.5 text-sm text-white/60">
                        <Zap className={`w-3.5 h-3.5 transition-colors ${isShort ? 'text-[#f59e0b]' : 'text-white/25'}`} />
                        Short (appears in Shorts feed only)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#080810] disabled:opacity-60 py-3 rounded-full font-semibold transition-all shadow-lg shadow-white/10 hover:bg-white/90"
              >
                {saving
                  ? <><span className="w-4 h-4 border-2 border-[#080810]/30 border-t-[#080810] rounded-full animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> {status === 'published' ? 'Publish Video' : 'Save as Draft'}</>
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
