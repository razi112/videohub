import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, ArrowLeft } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getEmbedUrl } from '../../lib/youtube'
import toast from 'react-hot-toast'

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { videos, categories, updateVideo } = useStore()
  const video = videos.find((v) => v.id === id)

  const [title, setTitle] = useState(video?.title || '')
  const [description, setDescription] = useState(video?.description || '')
  const [categoryId, setCategoryId] = useState(video?.category_id || '')
  const [tags, setTags] = useState(video?.tags?.join(', ') || '')
  const [status, setStatus] = useState<'published' | 'draft'>(video?.status || 'draft')
  const [isFeatured, setIsFeatured] = useState(video?.is_featured || false)
  const [duration, setDuration] = useState(video?.duration || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!video) navigate('/admin/videos')
  }, [video, navigate])

  if (!video) return null

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const selectedCategory = categories.find((c) => c.id === categoryId)
      await updateVideo(video.id, {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId || undefined,
        category: selectedCategory,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
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
      <button
        onClick={() => navigate('/admin/videos')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Videos
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">Edit Video</h1>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6 mb-6"
      >
        <p className="text-sm font-semibold text-gray-400 mb-3">Current Video</p>
        <div className="aspect-video rounded-xl overflow-hidden border border-[#2a2a3a]">
          <iframe
            src={getEmbedUrl(video.youtube_video_id, { rel: false })}
            title="Preview"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-xs text-gray-600 mt-2 font-mono">Video ID: {video.youtube_video_id}</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm text-gray-400 mb-2">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/30 transition-all" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/30 transition-all resize-none" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6c63ff]/60 transition-all">
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Duration</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="12:34"
              className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6c63ff]/60 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Tags</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="physics, science"
            className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6c63ff]/60 transition-all" />
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-3">Visibility</label>
            <div className="space-y-2">
              {(['published', 'draft'] as const).map((s) => (
                <label key={s} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="w-4 h-4 accent-[#6c63ff]" />
                  <span className="text-sm text-gray-300 capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-3">Featured</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#6c63ff]" />
              <span className="text-sm text-gray-300">Show on homepage hero</span>
            </label>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#6c63ff] hover:bg-[#5b53ee] disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-all"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}
