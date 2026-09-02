import { motion, AnimatePresence } from 'framer-motion'
import { Users, ExternalLink, Video as VideoIcon, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import SearchBar from '../components/ui/SearchBar'
import { useMemo, useState } from 'react'

/* ── Channel avatar ──────────────────────────────────────────
   Priority: DB thumbnail_url → first-video YouTube thumbnail → initials
   img.youtube.com has no CORS restriction so it always loads.
─────────────────────────────────────────────────────────── */
function ChannelAvatar({
  channelId,
  thumbnailUrl,
  name,
  size = 'md',
}: {
  channelId?: string
  thumbnailUrl?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const { videos } = useStore()

  // Pick the first published video belonging to this channel
  const firstVideoYtId = useMemo(() => {
    if (!channelId) return null
    return videos.find(v => v.channel_id === channelId && v.youtube_video_id)?.youtube_video_id ?? null
  }, [videos, channelId])

  // img.youtube.com is CORS-safe; use `default.jpg` (square crop) as channel stand-in
  const videoThumb = firstVideoYtId
    ? `https://img.youtube.com/vi/${firstVideoYtId}/default.jpg`
    : null

  // Source chain tried in order
  const sources = [thumbnailUrl, videoThumb].filter(Boolean) as string[]
  const [srcIndex, setSrcIndex] = useState(0)

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sizeClasses = {
    sm: 'w-11 h-11 rounded-xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
  }
  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl sm:text-2xl',
  }

  const currentSrc = sources[srcIndex]
  const showInitials = !currentSrc

  return (
    <div
      className={`${sizeClasses[size]} overflow-hidden shrink-0 relative flex items-center justify-center shadow-lg`}
      style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
    >
      {currentSrc && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setSrcIndex(i => i + 1)}
        />
      )}
      {showInitials && (
        <span className={`font-bold text-white select-none ${textSizes[size]}`}>
          {initials}
        </span>
      )}
    </div>
  )
}

export default function ChannelsPage() {
  const { channels, videos, searchQuery } = useStore()
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)

  const publishedChannels = useMemo(() => channels.filter(c => c.status === 'published'), [channels])
  const activeChannel = publishedChannels.find(c => c.id === activeChannelId)

  const channelVideos = useMemo(() => {
    if (!activeChannel) return []
    return videos.filter(v => v.status === 'published' && v.channel_id === activeChannel.channel_id)
  }, [videos, activeChannel])

  // O(n) single pass — avoids O(channels × videos) per render
  const videoCountByChannelId = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of videos) {
      if (v.status === 'published' && v.channel_id) {
        map.set(v.channel_id, (map.get(v.channel_id) ?? 0) + 1)
      }
    }
    return map
  }, [videos])


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
      <AnimatePresence mode="wait">
        {activeChannel ? (
          <motion.div key="detail" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>

            <button onClick={() => setActiveChannelId(null)}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> All Channels
            </button>

            {/* Channel hero */}
            <div className="glass-strong rounded-3xl p-5 sm:p-7 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none rounded-3xl" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                <ChannelAvatar
                  channelId={activeChannel.channel_id}
                  thumbnailUrl={activeChannel.thumbnail_url}
                  name={activeChannel.name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">{activeChannel.name}</h1>
                    {activeChannel.handle && <span className="text-sm text-white/30">{activeChannel.handle}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/30 mt-2">
                    {activeChannel.category && (
                      <span className="glass px-2.5 py-0.5 rounded-full text-[#a78bfa]/70">{activeChannel.category.name}</span>
                    )}
                    <span className="flex items-center gap-1"><VideoIcon className="w-3.5 h-3.5" />{channelVideos.length} videos</span>
                    <span>Since {new Date(activeChannel.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <a href={activeChannel.channel_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-500/15 border border-red-500/20 text-red-400/80 hover:text-red-400 hover:bg-red-500/25 px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0">
                  <ExternalLink className="w-4 h-4" /> YouTube
                </a>
              </div>
            </div>

            {channelVideos.length === 0 ? (
              <div className="text-center py-16">
                <VideoIcon className="w-10 h-10 mx-auto mb-3 text-white/10" />
                <p className="font-semibold text-white/40">No published videos yet</p>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-5">
                  Videos <span className="text-white/20 font-normal normal-case tracking-normal">({channelVideos.length})</span>
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {channelVideos.map((v, i) => (
                    <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <VideoCard video={v} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

        ) : (
          <motion.div key="list" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.3 }}>
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">Channels</h1>
              <p className="text-white/30 text-sm">Browse imported YouTube channels</p>
            </div>

            {publishedChannels.length === 0 ? (
              <div className="text-center py-24">
                <Users className="w-12 h-12 mx-auto mb-4 text-white/10" />
                <p className="font-semibold text-white/40 text-lg">No channels yet</p>
                <p className="text-sm mt-1 mb-6 text-white/25">Ask the admin to import a YouTube channel.</p>
                <Link to="/videos" className="glass px-6 py-3 rounded-full text-white/60 hover:text-white text-sm font-medium transition-all">
                  Browse Videos Instead
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6"><SearchBar /></div>
                {filteredChannels.length === 0 ? (
                  <p className="text-center text-white/30 py-12">No channels match your search.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredChannels.map((ch, i) => {
                      const videoCount = videoCountByChannelId.get(ch.channel_id) ?? 0
                      return (
                        <motion.div
                          key={ch.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          whileHover={{ y: -3 }}
                          className="glass-strong rounded-2xl overflow-hidden cursor-pointer group transition-all hover:bg-white/[0.07] relative"
                          onClick={() => setActiveChannelId(ch.id)}
                        >
                          {/* Top gleam */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-2xl" />
                          {/* Color bar */}
                          <div className="h-1 bg-gradient-to-r from-[#6c63ff]/60 to-[#a78bfa]/60 group-hover:from-[#6c63ff] group-hover:to-[#a78bfa] transition-all" />

                          <div className="p-5 relative">
                            <div className="flex items-start gap-4">
                              <ChannelAvatar
                                channelId={ch.channel_id}
                                thumbnailUrl={ch.thumbnail_url}
                                name={ch.name}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-white truncate group-hover:text-[#a78bfa] transition-colors">{ch.name}</p>
                                {ch.handle && <p className="text-xs text-white/30 mt-0.5">@{ch.handle}</p>}
                                {ch.category && (
                                  <span className="inline-block mt-1.5 text-xs glass px-2 py-0.5 rounded-full text-[#a78bfa]/60">{ch.category.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="mt-4 pt-3.5 border-t border-white/[0.05] flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-xs text-white/30">
                                <VideoIcon className="w-3.5 h-3.5" />{videoCount} video{videoCount !== 1 ? 's' : ''}
                              </span>
                              <div className="flex items-center gap-3">
                                <a href={ch.channel_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                  className="text-xs text-white/25 hover:text-red-400 transition-colors flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" /> YouTube
                                </a>
                                <span className="text-xs text-white/25 group-hover:text-[#a78bfa] transition-colors">View →</span>
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
