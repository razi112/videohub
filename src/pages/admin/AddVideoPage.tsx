import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, Search, Eye, Save, RefreshCw, PlayCircle
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import {
  extractYouTubeVideoId, getEmbedUrl, getThumbnailUrl,
} from '../../lib/youtube'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const inputCls = 'w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/30 transition-all'

export default function AddVideoPage() {
  const { categories, addVideo } = useStore()
  const navigate = useNavigate()

  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState<'published' | 'draft'>('published')
  const [isFeatured, setIsFeatured] = useState(false)
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)

  const handleFetch = async () => {
    const trimmed = url.trim()
    if (!trimmed) { toast.error('Please enter a YouTube URL'); return }

    const id = extractYouTubeVideoId(trimmed)
    if (!id) {
      toast.error('Could not find a video ID in this URL')
      return
    }

    setFetching(true)
    await new Promise(r => setTimeout(r, 400))
    setVideoId(id)
    setFetched(true)
    setFetching(false)
    toast.success('Video detected! Fill in the details below.')
  }

  const handleReset = () => {
    setUrl(''); setVideoId(''); setFetched(false); setTitle(''); setDescription('')
    setCategoryId(''); setTags(''); setStatus('published'); setIsFeatured(false); setDuration('')
  }

  const handleSaveVideo = async () => {
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
        views: 0,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Add Video</h1>
        <p className="text-gray-500 text-sm mt-1">Paste a YouTube video link to get started.</p>
      </motion.div>

      {/* URL Input */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6 mb-6"
      >
        <label className="block text-sm font-semibold text-gray-300 mb-3">YouTube URL</label>

        <div className="flex gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-xs bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-[#a78bfa] px-3 py-1 rounded-full">
            <PlayCircle className="w-3 h-3" /> Single video
          </span>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); if (fetched) handleReset() }}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="https://youtube.com/watch?v=..."
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
          Supports: youtube.com/watch?v= · youtu.be/ · youtube.com/shorts/
        </p>
      </motion.div>

      {/* Video form */}
      <AnimatePresence>
        {fetched && videoId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {/* Preview */}
            <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                  <Eye className="w-4 h-4 text-[#6c63ff]" /> Video Preview
                </h3>
                <span className="text-xs bg-[#6c63ff]/15 text-[#a78bfa] px-2 py-1 rounded-full font-mono">
                  {videoId}
                </span>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden border border-[#1e1e2e]">
                <iframe
                  src={getEmbedUrl(videoId, { rel: false })}
                  title="Preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Form */}
            <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6 space-y-4 sm:space-y-5">
              <h3 className="font-semibold text-white text-sm sm:text-base">Video Information</h3>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Enter video title" className={inputCls} />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Enter video description..." rows={3}
                  className={`${inputCls} resize-none`} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duration (e.g. 12:34)</label>
                  <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
                    placeholder="12:34" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="physics, science, class10" className={inputCls} />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Visibility</label>
                  <div className="space-y-2">
                    {(['published', 'draft'] as const).map(s => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="vstatus" value={s} checked={status === s}
                          onChange={() => setStatus(s)} className="w-4 h-4 accent-[#6c63ff]" />
                        <span className="text-sm text-gray-300 capitalize">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Featured</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 accent-[#6c63ff]" />
                    <span className="text-sm text-gray-300">Show on homepage hero</span>
                  </label>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={handleSaveVideo} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6c63ff] to-[#5b53ee] disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-all shadow-md shadow-[#6c63ff]/20"
              >
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> {status === 'published' ? 'Publish Video' : 'Save as Draft'}</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
