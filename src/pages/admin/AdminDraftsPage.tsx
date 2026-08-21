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
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">Drafts</h1>
        <p className="text-white/40 text-sm mb-6 sm:mb-8">
          {drafts.length} unpublished video{drafts.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {drafts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 text-white/25">
          <p className="text-3xl mb-3">📄</p>
          <p className="font-semibold text-white/40">No drafts</p>
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
              whileHover={{ y: -4 }}
              style={{ willChange: 'transform' }}
              className="relative glass rounded-2xl overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  src={v.thumbnail_url || getThumbnailUrl(v.youtube_video_id)}
                  alt={v.title}
                  className="w-full h-full object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="glass text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                    DRAFT
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white/80 font-semibold text-sm mb-1 line-clamp-2 group-hover:text-white transition-colors duration-200">
                  {v.title}
                </h3>
                <p className="text-xs text-white/30 mb-4">
                  {v.category?.name} · {new Date(v.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Link to={`/admin/videos/edit/${v.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 glass text-white/50 hover:text-white rounded-full text-xs transition-all">
                      <Edit2 className="w-3 h-3" /> Edit
                    </Link>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => handlePublish(v.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 glass text-emerald-400 hover:bg-emerald-500/20 rounded-full text-xs border border-emerald-500/25 transition-all"
                  >
                    <CheckCircle className="w-3 h-3" /> Publish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(v.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 glass text-red-400 hover:bg-red-500/20 rounded-full text-xs border border-red-500/20 transition-all ml-auto"
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
