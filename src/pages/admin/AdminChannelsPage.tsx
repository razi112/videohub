import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Users, ExternalLink, Trash2, Eye, EyeOff, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminChannelsPage() {
  const { channels, deleteChannel, updateChannel } = useStore()

  const handleDelete = (id: string) => {
    if (!confirm('Delete this channel record? (Videos will stay)')) return
    deleteChannel(id)
    toast.success('Channel removed')
  }

  const handleToggle = (id: string, status: 'published' | 'draft') => {
    updateChannel(id, { status })
    toast.success(status === 'published' ? 'Channel published' : 'Channel hidden')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Channels</h1>
          <p className="text-gray-500 text-sm mt-0.5">{channels.length} imported channel{channels.length !== 1 ? 's' : ''}</p>
        </div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link to="/admin/channels/add"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6c63ff] to-[#5b53ee] text-white rounded-xl text-sm font-medium shadow-md shadow-[#6c63ff]/20">
            <Plus className="w-4 h-4" /> Import Channel
          </Link>
        </motion.div>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-gray-400 mb-2">No channels imported yet</p>
          <p className="text-sm mb-6">Go to Add Video and paste a YouTube channel link.</p>
          <Link to="/admin/channels/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6c63ff] hover:bg-[#5b53ee] text-white rounded-xl text-sm font-medium transition-colors">
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
              className={`bg-[#0d0d14] rounded-2xl border overflow-hidden group ${
                ch.status === 'published' ? 'border-[#1e1e2e]' : 'border-[#1e1e2e] opacity-60'
              }`}
            >
              {/* Header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{ch.name}</p>
                    {ch.handle && (
                      <p className="text-xs text-gray-500">@{ch.handle}</p>
                    )}
                    <p className="text-xs text-gray-600 font-mono truncate mt-0.5">{ch.channel_id}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    ch.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {ch.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
                  {ch.category && <span className="text-[#6c63ff]/70">{ch.category.name}</span>}
                  <span>{ch.video_count ?? 0} videos imported</span>
                  <span>{new Date(ch.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 px-4 py-3 border-t border-[#1e1e2e] bg-[#0a0a10]">
                <motion.a
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  href={ch.channel_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16161e] border border-[#2a2a3a] hover:border-[#6c63ff]/30 text-gray-400 hover:text-white rounded-lg text-xs transition-all"
                >
                  <ExternalLink className="w-3 h-3" /> YouTube
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(ch.id, ch.status === 'published' ? 'draft' : 'published')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16161e] border border-[#2a2a3a] hover:border-blue-500/30 text-gray-400 hover:text-blue-400 rounded-lg text-xs transition-all"
                  title={ch.status === 'published' ? 'Hide' : 'Publish'}
                >
                  {ch.status === 'published'
                    ? <><EyeOff className="w-3 h-3" /> Hide</>
                    : <><Eye className="w-3 h-3" /> Publish</>}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(ch.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/8 border border-red-500/15 text-red-400/70 hover:text-red-400 hover:bg-red-500/15 rounded-lg text-xs transition-all ml-auto"
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
