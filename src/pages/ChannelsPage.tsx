import { motion, AnimatePresence } from 'framer-motion'
import { Users, ExternalLink, Video as VideoIcon, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import SearchBar from '../components/ui/SearchBar'
import { useMemo, useState } from 'react'

export default function ChannelsPage() {
  const { channels, videos, searchQuery } = useStore()
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)

  const publishedChannels = useMemo(
    () => channels.filter(c => c.status === 'published'),
    [channels]
  )

  const activeChannel = publishedChannels.find(c => c.id === activeChannelId)

  // Match videos by the YouTube channel_id stored at import time
  const channelVideos = useMemo(() => {
    if (!activeChannel) return []
    return videos.filter(v =>
      v.status === 'published' && v.channel_id === activeChannel.channel_id
    )
  }, [videos, activeChannel])

  // Filtered by search when browsing all channels
  const filteredChannels = useMemo(() => {
    if (!searchQuery) return publishedChannels
    const q = searchQuery.toLowerCase()
    return publishedChannels.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.handle?.toLowerCase().includes(q) ||
      c.category?.name.toLowerCase().includes(q)
    )
  }, [publishedChannels, searchQuery])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

      {/* ── Channel detail view ── */}
      <AnimatePresence mode="wait">
        {activeChannel ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Back button */}
            <button
              onClick={() => setActiveChannelId(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              All Channels
            </button>

            {/* Channel hero */}
            <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-5 sm:p-7 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center shrink-0 shadow-xl shadow-[#6c63ff]/25">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">{activeChannel.name}</h1>
                    {activeChannel.handle && (
                      <span className="text-sm text-gray-500">@{activeChannel.handle}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                    {activeChannel.category && (
                      <span className="bg-[#6c63ff]/15 text-[#a78bfa] px-2 py-0.5 rounded-full">
                        {activeChannel.category.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <VideoIcon className="w-3.5 h-3.5" />
                      {channelVideos.length} video{channelVideos.length !== 1 ? 's' : ''}
                    </span>
                    <span>Imported {new Date(activeChannel.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <a
                  href={activeChannel.channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/15 border border-red-500/25 text-red-400 hover:bg-red-600/25 rounded-xl text-sm font-medium transition-all shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on YouTube
                </a>
              </div>
            </div>

            {/* Videos grid */}
            {channelVideos.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <VideoIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-gray-400">No published videos for this channel</p>
                <p className="text-sm mt-1">Videos will appear here once the admin publishes them.</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-white mb-5">
                  Videos
                  <span className="ml-2 text-sm font-normal text-gray-500">({channelVideos.length})</span>
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {channelVideos.map((v, i) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <VideoCard video={v} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

        ) : (
          /* ── Channel list view ── */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Channels</h1>
              <p className="text-gray-500 text-sm">Browse imported YouTube channels</p>
            </div>

            {publishedChannels.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-semibold text-gray-400 text-lg">No channels yet</p>
                <p className="text-sm mt-1 mb-6">Ask the admin to import a YouTube channel.</p>
                <Link to="/videos"
                  className="inline-block bg-[#6c63ff] hover:bg-[#5b53ee] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                  Browse Videos Instead
                </Link>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="mb-6">
                  <SearchBar />
                </div>

                {filteredChannels.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">No channels match your search.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {filteredChannels.map((ch, i) => {
                      const videoCount = videos.filter(
                        v => v.status === 'published' && v.channel_id === ch.channel_id
                      ).length

                      return (
                        <motion.div
                          key={ch.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          whileHover={{ y: -4 }}
                          style={{ willChange: 'transform' }}
                          className="group bg-[#111118] border border-[#2a2a3a] hover:border-[#6c63ff]/40 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:shadow-[#6c63ff]/8"
                          onClick={() => setActiveChannelId(ch.id)}
                        >
                          {/* Top gradient bar */}
                          <div className="h-1.5 bg-gradient-to-r from-[#6c63ff] to-[#a78bfa] opacity-60 group-hover:opacity-100 transition-opacity" />

                          <div className="p-5">
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <motion.div
                                whileHover={{ scale: 1.08, rotate: -3 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center shrink-0 shadow-md shadow-[#6c63ff]/20"
                              >
                                <Users className="w-6 h-6 text-white" />
                              </motion.div>

                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm sm:text-base text-white truncate group-hover:text-[#a78bfa] transition-colors">
                                  {ch.name}
                                </p>
                                {ch.handle && (
                                  <p className="text-xs text-gray-500 mt-0.5">@{ch.handle}</p>
                                )}
                                {ch.category && (
                                  <span className="inline-block mt-1.5 text-xs bg-[#6c63ff]/10 text-[#a78bfa]/80 px-2 py-0.5 rounded-full">
                                    {ch.category.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stats row */}
                            <div className="mt-4 pt-4 border-t border-[#2a2a3a] flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                <VideoIcon className="w-3.5 h-3.5" />
                                {videoCount} video{videoCount !== 1 ? 's' : ''}
                              </span>
                              <div className="flex items-center gap-3">
                                <a
                                  href={ch.channel_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-400 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" /> YouTube
                                </a>
                                <span className="text-xs text-[#6c63ff] group-hover:text-[#a78bfa] transition-colors font-medium">
                                  View →
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
