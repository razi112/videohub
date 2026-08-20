import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Eye, Trash2, Star, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { getThumbnailUrl } from '../../lib/youtube'
import type { Video } from '../../types'
import toast from 'react-hot-toast'

interface VideoRowProps {
  video: Video
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: 'published' | 'draft') => void
  onToggleFeatured: (id: string, featured: boolean) => void
}

const iconBtn = (color: string) =>
  `p-1.5 rounded-lg transition-all duration-150 text-gray-600 ${color}`

function VideoRow({ video, onDelete, onToggleStatus, onToggleFeatured }: VideoRowProps) {
  const navigate = useNavigate()
  const thumbnail = video.thumbnail_url || getThumbnailUrl(video.youtube_video_id)

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25 }}
      whileHover={{ backgroundColor: '#111118' }}
      className="border-b border-[#1e1e2e] transition-colors"
    >
      <td className="py-2.5 px-3 sm:py-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <motion.img
            whileHover={{ scale: 1.08, borderRadius: '10px' }}
            transition={{ duration: 0.2 }}
            src={thumbnail}
            alt={video.title}
            className="w-12 h-8 sm:w-14 sm:h-9 object-cover rounded-lg shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-white font-medium truncate max-w-[130px] sm:max-w-[200px]">{video.title}</p>
            <p className="text-xs text-gray-600 truncate max-w-[130px] sm:max-w-[200px] font-mono hidden sm:block">{video.youtube_video_id}</p>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
        {video.category?.name || '—'}
      </td>
      <td className="py-2.5 px-3 sm:py-3 sm:px-4 hidden lg:table-cell">
        <motion.span
          whileHover={{ scale: 1.05 }}
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            video.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
          }`}
        >
          {video.status}
        </motion.span>
      </td>
      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm text-gray-500 hidden xl:table-cell tabular-nums">
        {video.views.toLocaleString()}
      </td>
      <td className="py-2.5 px-3 sm:py-3 sm:px-4">
        <div className="flex items-center gap-0.5">
          <motion.button whileHover={{ scale: 1.2, y: -1 }} whileTap={{ scale: 0.88 }} transition={{ duration: 0.15 }}
            onClick={() => navigate(`/admin/videos/edit/${video.id}`)}
            className={iconBtn('hover:text-[#6c63ff] hover:bg-[#6c63ff]/10')} title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </motion.button>
          <Link to={`/videos/${video.id}`} target="_blank">
            <motion.button whileHover={{ scale: 1.2, y: -1 }} whileTap={{ scale: 0.88 }} transition={{ duration: 0.15 }}
              className={iconBtn('hover:text-white hover:bg-[#1e1e2e]')} title="Preview">
              <Eye className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
          <motion.button whileHover={{ scale: 1.2, y: -1, rotate: 15 }} whileTap={{ scale: 0.88 }} transition={{ duration: 0.15 }}
            onClick={() => onToggleFeatured(video.id, !video.is_featured)}
            className={`${iconBtn('')} ${video.is_featured ? 'text-yellow-400 hover:bg-yellow-500/10' : 'hover:text-yellow-400 hover:bg-yellow-500/10'}`}
            title={video.is_featured ? 'Unfeature' : 'Feature'}>
            <Star className={`w-3.5 h-3.5 ${video.is_featured ? 'fill-yellow-400' : ''}`} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.2, y: -1 }} whileTap={{ scale: 0.88 }} transition={{ duration: 0.15 }}
            onClick={() => onToggleStatus(video.id, video.status === 'published' ? 'draft' : 'published')}
            className={iconBtn('hover:text-blue-400 hover:bg-blue-500/10')}
            title={video.status === 'published' ? 'Unpublish' : 'Publish'}>
            <EyeOff className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.2, y: -1 }} whileTap={{ scale: 0.88 }} transition={{ duration: 0.15 }}
            onClick={() => onDelete(video.id)}
            className={iconBtn('hover:text-red-400 hover:bg-red-500/10')} title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  )
}

export default function AdminVideosPage() {
  const { videos, deleteVideo, updateVideo } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  const filtered = useMemo(() => {
    let result = videos
    if (statusFilter !== 'all') result = result.filter(v => v.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(v => v.title.toLowerCase().includes(q) || v.category?.name.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [videos, search, statusFilter])

  const handleDelete = (id: string) => {
    if (!confirm('Delete this video?')) return
    deleteVideo(id).then(() => toast.success('Video deleted')).catch(() => toast.error('Failed to delete video'))
  }
  const handleToggleStatus = (id: string, status: 'published' | 'draft') => {
    updateVideo(id, { status }).then(() => toast.success(`Video ${status === 'published' ? 'published' : 'unpublished'}`)).catch(() => toast.error('Failed to update video'))
  }
  const handleToggleFeatured = (id: string, featured: boolean) => {
    updateVideo(id, { is_featured: featured }).then(() => toast.success(featured ? 'Video featured' : 'Unfeatured')).catch(() => toast.error('Failed to update video'))
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-xl sm:text-2xl font-bold text-white">All Videos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{videos.length} total videos</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link to="/admin/videos/add"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6c63ff] to-[#5b53ee] text-white rounded-xl text-sm font-medium shadow-md shadow-[#6c63ff]/20 hover:shadow-[#6c63ff]/40 transition-shadow">
            <Plus className="w-4 h-4" /> Add Video
          </Link>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..."
            className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#6c63ff]/50 focus:ring-1 focus:ring-[#6c63ff]/20 transition-all"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {(['all', 'published', 'draft'] as const).map(s => (
            <motion.button key={s} whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-medium capitalize border transition-all ${
                statusFilter === s
                  ? 'bg-[#6c63ff]/15 border-[#6c63ff]/40 text-[#a78bfa]'
                  : 'bg-[#0d0d14] border-[#1e1e2e] text-gray-500 hover:text-white hover:border-[#2a2a3a]'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                {['Video','Category','Status','Views','Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    i === 1 ? 'hidden md:table-cell' : i === 2 ? 'hidden lg:table-cell' : i === 3 ? 'hidden xl:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map(v => (
                  <VideoRow key={v.id} video={v}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 sm:py-16 text-gray-600">
            <p className="text-2xl mb-2">🎬</p>
            <p className="text-sm">No videos found</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
