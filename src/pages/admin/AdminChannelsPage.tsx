import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Users, ExternalLink, Trash2, Eye, EyeOff, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminChannelsPage() {
  const { channels, deleteChannel, updateChannel } = useStore()

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this channel record? (Videos will stay)')) return
    try {
      await deleteChannel(id)
      toast.success('Channel removed')
    } catch {
      toast.error('Failed to delete channel')
    }
  }

  const handleToggle = async (id: string, status: 'published' | 'draft') => {
    try {
      await updateChannel(id, { status })
      toast.success(status === 'published' ? 'Channel published' : 'Channel hidden')
    } catch {
      toast.error('Failed to update channel')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Channels</h1>
          <p className="text-white/40 text-sm mt-0.5">{channels.length} imported channel{channels.length !== 1 ? 's' : ''}</p>
        </div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link to="/admin/channels/add"
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#080810] rounded-full text-sm font-semibold shadow-lg shadow-white/10 hover:bg-white/90 transition-all">
            <Plus className="w-4 h-4" /> Import Channel
          </Link>
        </motion.div>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-20 text-white/25">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-white/40 mb-2">No channels imported yet</p>
          <p className="text-sm mb-6">Go to Add Channel and paste a YouTube channel link.</p>
          <Link to="/admin/channels/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#080810] rounded-full text-sm font-semibold shadow-lg shadow-white/10 hover:bg-white/90 transition-all">
            <Plus className="w-4 h-4" /> Import a Channel
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((ch, i) => (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className={`relative glass rounded-2xl overflow-hidden group ${ch.status !== 'published' ? 'opacity-60' : ''}`}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

              {/* Header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="relative w-11 h-11 rounded-xl shrink-0 overflow-hidden">
                    {/* Fallback */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    {/* Thumbnail */}
                    {ch.thumbnail_url && (
                      <img
                        src={ch.thumbnail_url}
                        alt={ch.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white/90 truncate">{ch.name}</p>
                    {ch.handle && <p className="text-xs text-white/35">@{ch.handle}</p>}
                    <p className="text-xs text-white/20 font-mono truncate mt-0.5">{ch.channel_id}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full shrink-0 glass ${
                    ch.status === 'published'
                      ? 'text-emerald-400 border-emerald-500/25'
                      : 'text-amber-400 border-amber-500/25'
                  }`}>
                    {ch.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-white/30">
                  {ch.category && <span className="text-[#a78bfa]/70">{ch.category.name}</span>}
                  <span>{ch.video_count ?? 0} videos</span>
                  <span>{new Date(ch.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-t border-white/[0.06]">
                <motion.a
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  href={ch.channel_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 glass text-white/45 hover:text-white rounded-full text-xs transition-all"
                >
                  <ExternalLink className="w-3 h-3" /> YouTube
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(ch.id, ch.status === 'published' ? 'draft' : 'published')}
                  className="flex items-center gap-1.5 px-3 py-1.5 glass text-white/45 hover:text-blue-400 rounded-full text-xs transition-all"
                  title={ch.status === 'published' ? 'Hide' : 'Publish'}
                >
                  {ch.status === 'published'
                    ? <><EyeOff className="w-3 h-3" /> Hide</>
                    : <><Eye className="w-3 h-3" /> Publish</>}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(ch.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 glass text-red-400/60 hover:text-red-400 hover:bg-red-500/15 rounded-full text-xs border border-red-500/15 transition-all ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
