import { memo } from 'react'
import { motion } from 'framer-motion'
import { Play, Eye, Star, Headphones, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Video } from '../../types'
import { getThumbnailUrl } from '../../lib/youtube'
import { useAudioPlayer } from '../../store/useAudioPlayer'

interface VideoCardProps {
  video: Video
  showCategory?: boolean
}

function formatViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

// Cache formatted dates so toLocaleDateString (expensive Intl) runs only once per unique ISO string
const dateCache = new Map<string, string>()
function formatDate(iso: string): string {
  if (dateCache.has(iso)) return dateCache.get(iso)!
  const formatted = new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  dateCache.set(iso, formatted)
  return formatted
}

const SONG_TAGS = new Set(['music', 'song', 'audio', 'nasheed', 'qawwali', 'naat', 'track', 'album'])
function isSong(video: Video): boolean {
  return video.tags?.some(t => SONG_TAGS.has(t.toLowerCase())) ?? false
}

function VideoCard({ video, showCategory = true }: VideoCardProps) {
  const thumbnail = video.thumbnail_url || getThumbnailUrl(video.youtube_video_id, 'high')
  const song = isSong(video)

  // Granular selectors — each card only re-renders when ITS own audio state changes
  const isCurrentAudio = useAudioPlayer(s => s.currentVideo?.id === video.id)
  const isPlaying = useAudioPlayer(s => s.isPlaying && s.currentVideo?.id === video.id)
  const playVideo = useAudioPlayer(s => s.playVideo)

  function handleAudio(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isCurrentAudio) {
      useAudioPlayer.getState().togglePlay()
    } else {
      playVideo(video)
    }
  }

  return (
    <motion.div
      initial={false}
      whileHover="hover"
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        willChange: 'transform',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Top-edge gleam */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

      <Link to={`/videos/${video.id}?autoplay=1`} className="block">

        {/* ── Thumbnail ── */}
        <div className="relative overflow-hidden aspect-video bg-black/30">

          {/* Image */}
          <motion.img
            src={thumbnail}
            alt={video.title}
            loading="lazy"
            decoding="async"
            variants={{ hover: { scale: 1.08 } }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://img.youtube.com/vi/${video.youtube_video_id}/mqdefault.jpg`
            }}
          />

          {/* Gradient overlay slides up on hover */}
          <motion.div
            variants={{ hover: { opacity: 1, y: 0 } }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"
          />

          {/* Play button */}
          <motion.div
            variants={{ hover: { opacity: 1, scale: 1, y: 0 } }}
            initial={{ opacity: 0, scale: 0.6, y: 6 }}
            transition={{ duration: 0.25, ease: 'backOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              {/* Outer ripple ring — liquid glass tint */}
              <motion.div
                variants={{ hover: { scale: 1.7, opacity: 0 } }}
                initial={{ scale: 1, opacity: 0.25 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(108,99,255,0.35)' }}
              />
              {/* Second softer ripple */}
              <motion.div
                variants={{ hover: { scale: 1.4, opacity: 0 } }}
                initial={{ scale: 1, opacity: 0.15 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(167,139,250,0.3)' }}
              />
              {/* Liquid glass play button */}
              <div
                className="relative w-13 h-13 rounded-full flex items-center justify-center"
                style={{
                  width: '52px',
                  height: '52px',
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.15)',
                }}
              >
                {/* Inner top-edge gleam */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 55%)',
                  }}
                />
                <Play className="relative z-10 w-5 h-5 text-white fill-white drop-shadow-lg ml-0.5" />
              </div>
            </div>
          </motion.div>

          {/* Title preview slides up on hover */}
          <motion.div
            variants={{ hover: { opacity: 1, y: 0 } }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="absolute bottom-2 left-3 right-10 pointer-events-none"
          >
            <p className="text-white text-xs font-medium line-clamp-1 drop-shadow-lg">
              {video.title}
            </p>
          </motion.div>

          {/* Duration badge — liquid glass, always visible */}
          {video.duration && (
            <div
              className="absolute bottom-2 right-2 z-10 flex items-center gap-1 text-[11px] font-semibold tracking-wide select-none
                         transition-all duration-200
                         group-hover:scale-105 group-hover:-translate-y-px"
              style={{
                color: 'rgba(255,255,255,0.92)',
                background: 'rgba(8,8,16,0.72)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '2px 7px 3px',
              }}
            >
              {song && <span className="text-[11px] leading-none mr-0.5 opacity-75">♪</span>}
              {video.duration}
            </div>
          )}

          {/* Featured badge */}
          {video.is_featured && (
            <div
              className="absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shadow-md text-yellow-400"
              style={{
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(234,179,8,0.3)',
              }}
            >
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              Featured
            </div>
          )}

          {/* Live badge */}
          {video.is_live && (
            <div
              className="absolute top-2 right-2 flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full shadow-md text-red-400"
              style={{
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(239,68,68,0.4)',
              }}
            >
              {/* Pulsing red dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <Radio className="w-2.5 h-2.5" />
              LIVE
            </div>
          )}

          {/* Hover border gleam */}
          <motion.div
            variants={{ hover: { opacity: 1 } }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 rounded-t-2xl ring-1 ring-inset ring-white/20 pointer-events-none"
          />
        </div>

        {/* ── Info strip ── */}
        <motion.div
          variants={{ hover: { background: 'rgba(255,255,255,0.07)' } }}
          transition={{ duration: 0.2 }}
          className="p-3 sm:p-4 border-t border-white/[0.07] relative"
        >
          {/* Title */}
          <motion.h3
            variants={{ hover: { color: '#c4b5fd' } }}
            transition={{ duration: 0.2 }}
            className="text-white/85 font-semibold text-xs sm:text-sm leading-snug line-clamp-2"
          >
            {video.title}
          </motion.h3>

          {/* Meta row */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              {showCategory && video.category && (
                <motion.span
                  variants={{ hover: { color: '#a78bfa' } }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px] sm:text-xs text-[#a78bfa]/70 font-medium truncate shrink-0"
                >
                  {video.category.name}
                </motion.span>
              )}
              {showCategory && video.category && (
                <span className="text-white/20 text-xs shrink-0">·</span>
              )}
              <span className="text-[10px] sm:text-xs text-white/35 truncate">
                {formatDate(video.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Headphone / audio mode button */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleAudio}
                className="flex items-center justify-center w-6 h-6 rounded-full transition-all"
                style={{
                  background: isCurrentAudio ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isCurrentAudio ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                }}
                aria-label="Play audio"
                title="Listen as audio"
              >
                {isCurrentAudio && isPlaying
                  ? (
                    /* Animated bars when playing */
                    <span className="flex items-end gap-[2px] h-3">
                      {[0, 0.15, 0.07].map((delay, i) => (
                        <motion.span
                          key={i}
                          className="w-[2px] rounded-full"
                          style={{ background: '#a78bfa' }}
                          animate={{ height: ['4px', '10px', '4px'] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay, ease: 'easeInOut' }}
                        />
                      ))}
                    </span>
                  )
                  : (
                    <Headphones
                      className="w-3 h-3"
                      style={{ color: isCurrentAudio ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}
                    />
                  )
                }
              </motion.button>

              <motion.span
                variants={{ hover: { color: 'rgba(255,255,255,0.7)' } }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 text-[10px] sm:text-xs text-white/35"
              >
                <Eye className="w-3 h-3" />
                {formatViews(video.views)}
              </motion.span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default memo(VideoCard)
