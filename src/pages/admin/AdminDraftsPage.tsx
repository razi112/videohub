import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Link } from 'react-router-dom'
import { Edit2, CheckCircle, Trash2 } from 'lucide-react'
import { getThumbnailUrl } from '../../lib/youtube'
import toast from 'react-hot-toast'
import { useMemo } from 'react'

export default function AdminDraftsPage() {
  const { videos, updateVideo, deleteVideo } = useStore()
  const drafts = useMemo(() => videos.filter(v => v.status === 'draft'), [videos])

  const handlePublish = (id: string) => {
    updateVideo(id, { status: 'published' })
    toast.success('Video published!')
  }
  const handleDelete = (id: string) => {
    if (!confirm('Delete this draft?')) return
    deleteVideo(id)
    toast.success('Draft deleted')
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Drafts</h1>
        <p className="text-gray-500 text-sm mb-6 sm:mb-8">
          {drafts.length} unpublished video{drafts.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {drafts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 text-gray-600"
        >
          <p className="text-3xl mb-3">📄</p>
          <p className="font-semibold text-gray-400">No drafts</p>
          <p className="text-sm mt-1">All your videos are published!</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {drafts.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileHover={{ y: -4, boxShadow: '0 16px 40px -8px rgba(0,0,0,0.5)' }}
              style={{ willChange: 'transform' }}
              className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  src={v.thumbnail_url || getThumbnailUrl(v.youtube_video_id)}
                  alt={v.title}
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    whileHover={{ scale: 1.08 }}
                    className="bg-amber-400/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md"
                  >
                    DRAFT
                  </motion.span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-[#a78bfa] transition-colors duration-200">
                  {v.title}
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  {v.category?.name} · {new Date(v.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Link to={`/admin/videos/edit/${v.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16161e] border border-[#2a2a3a] hover:border-[#6c63ff]/40 text-gray-400 hover:text-white rounded-xl text-xs transition-all">
                      <Edit2 className="w-3 h-3" /> Edit
                    </Link>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => handlePublish(v.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 rounded-xl text-xs transition-all"
                  >
                    <CheckCircle className="w-3 h-3" /> Publish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(v.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-xs transition-all ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
