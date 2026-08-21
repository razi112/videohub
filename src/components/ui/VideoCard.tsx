import { motion } from 'framer-motion'
import { Play, Eye, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Video } from '../../types'
import { getThumbnailUrl } from '../../lib/youtube'

interface VideoCardProps {
  video: Video
  showCategory?: boolean
}

function formatViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const SONG_TAGS = new Set(['music', 'song', 'audio', 'nasheed', 'qawwali', 'naat', 'track', 'album'])
function isSong(video: Video): boolean {
  return video.tags?.some(t => SONG_TAGS.has(t.toLowerCase())) ?? false
}

export default function VideoCard({ video, showCategory = true }: VideoCardProps) {
  const thumbnail = video.thumbnail_url || getThumbnailUrl(video.youtube_video_id, 'high')
  const song = isSong(video)

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
              {/* Ripple ring */}
              <motion.div
                variants={{ hover: { scale: 1.6, opacity: 0 } }}
                initial={{ scale: 1, opacity: 0.35 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-white/40"
              />
              {/* Glass play button */}
              <div
                className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-2xl shadow-black/40"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.9)',
                }}
              >
                <Play className="w-5 h-5 text-[#6c63ff] fill-[#6c63ff] ml-0.5" />
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

          {/* Duration badge — liquid glass */}
          {video.duration && (
            <motion.div
              variants={{
                hover: {
                  background: 'rgba(255,255,255,0.18)',
                  borderColor: 'rgba(255,255,255,0.32)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)',
                  color: 'rgba(255,255,255,1)',
                  scale: 1.06,
                  y: -1,
                },
              }}
              transition={{ duration: 0.22 }}
              className="absolute bottom-2 right-2 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-white/85 px-2 py-[3px] rounded-lg select-none"
              style={{
                background: 'rgba(0,0,0,0.52)',
                backdropFilter: 'blur(16px) saturate(200%)',
                WebkitBackdropFilter: 'blur(16px) saturate(200%)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.14)',
              }}
            >
              {song && <span className="text-[12px] leading-none opacity-80">♪</span>}
              {video.duration}
            </motion.div>
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

            <motion.span
              variants={{ hover: { color: 'rgba(255,255,255,0.7)' } }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-white/35 shrink-0"
            >
              <Eye className="w-3 h-3" />
              {formatViews(video.views)}
            </motion.span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
