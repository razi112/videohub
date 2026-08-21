import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, Music } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getEmbedUrl } from '../../lib/youtube'
import toast from 'react-hot-toast'

const inputCls = 'w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#6c63ff]/50 focus:ring-1 focus:ring-[#6c63ff]/20 transition-all'

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { videos, categories, updateVideo } = useStore()
  const video = videos.find(v => v.id === id)

  const [title, setTitle]         = useState(video?.title || '')
  const [description, setDescription] = useState(video?.description || '')
  const [categoryId, setCategoryId]   = useState(video?.category_id || '')
  const [tags, setTags]           = useState(video?.tags?.join(', ') || '')
  const [status, setStatus]       = useState<'published' | 'draft'>(video?.status || 'draft')
  const [isFeatured, setIsFeatured]   = useState(video?.is_featured || false)
  const [isSong, setIsSong]       = useState(video?.tags?.includes('music') ?? false)
  const [duration, setDuration]   = useState(video?.duration || '')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    if (!video) navigate('/admin/videos')
  }, [video, navigate])

  if (!video) return null

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const selectedCategory = categories.find(c => c.id === categoryId)
      await updateVideo(video.id, {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId || undefined,
        category: selectedCategory,
        tags: (() => {
          const base = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
          if (isSong && !base.includes('music')) return ['music', ...base]
          if (!isSong) return base.filter(t => t !== 'music')
          return base
        })(),
        status,
        is_featured: isFeatured,
        duration: duration.trim() || undefined,
      })
      toast.success('Video updated successfully!')
      navigate('/admin/videos')
    } catch {
      toast.error('Failed to update video. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <motion.button
        whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/admin/videos')}
        className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Videos
      </motion.button>

      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-7">Edit Video</h1>

      {/* Preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative glass rounded-2xl p-5 sm:p-6 mb-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        <p className="text-sm font-semibold text-white/50 mb-3">Current Video</p>
        <div className="aspect-video rounded-xl overflow-hidden border border-white/[0.08]">
          <iframe
            src={getEmbedUrl(video.youtube_video_id, { rel: false })} title="Preview"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-xs text-white/20 mt-2 font-mono">Video ID: {video.youtube_video_id}</p>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative glass rounded-2xl p-5 sm:p-6 space-y-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

        <div>
          <label className="block text-sm text-white/50 mb-2">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-2">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
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
            <label className="block text-sm text-white/50 mb-2">Duration</label>
            <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
              placeholder="12:34" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-2">Tags</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)}
            placeholder="physics, science" className={inputCls} />
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-white/50 mb-3">Visibility</label>
            <div className="space-y-2">
              {(['published', 'draft'] as const).map(s => (
                <label key={s} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="status" value={s} checked={status === s}
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
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01, y: -1 }}
          onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-white text-[#080810] disabled:opacity-60 py-3 rounded-full font-semibold transition-all shadow-lg shadow-white/10 hover:bg-white/90"
        >
          {saving
            ? <><span className="w-4 h-4 border-2 border-[#080810]/30 border-t-[#080810] rounded-full animate-spin" /> Saving…</>
            : <><Save className="w-4 h-4" /> Save Changes</>
          }
        </motion.button>
      </motion.div>
    </div>
  )
}
