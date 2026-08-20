import { motion } from 'framer-motion'
import { Play, Eye, Star, Clock } from 'lucide-react'
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

export default function VideoCard({ video, showCategory = true }: VideoCardProps) {
  const thumbnail = video.thumbnail_url || getThumbnailUrl(video.youtube_video_id, 'high')

  return (
    <motion.div
      initial={false}
      whileHover="hover"
      className="group relative bg-[#16161e] rounded-2xl overflow-hidden border border-[#2a2a3a] cursor-pointer"
      style={{ willChange: 'transform' }}
    >
      <Link to={`/videos/${video.id}`} className="block">

        {/* ── Thumbnail ── */}
        <div className="relative overflow-hidden aspect-video bg-[#0e0e16]">

          {/* Image — zoom on hover */}
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

          {/* Dark gradient — slides up from bottom */}
          <motion.div
            variants={{ hover: { opacity: 1, y: 0 } }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"
          />

          {/* Play button — pops in from center */}
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
                initial={{ scale: 1, opacity: 0.4 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-[#6c63ff]"
              />
              <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-black/40">
                <Play className="w-5 h-5 text-[#6c63ff] fill-[#6c63ff] ml-0.5" />
              </div>
            </div>
          </motion.div>

          {/* Bottom-left: title preview slides up */}
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

          {/* Duration badge */}
          {video.duration && (
            <motion.div
              variants={{ hover: { opacity: 0, scale: 0.8 } }}
              initial={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-md font-mono flex items-center gap-1"
            >
              <Clock className="w-2.5 h-2.5" />
              {video.duration}
            </motion.div>
          )}

          {/* Featured badge */}
          {video.is_featured && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Star className="w-2.5 h-2.5 fill-black" />
              Featured
            </div>
          )}

          {/* Glowing border on hover */}
          <motion.div
            variants={{ hover: { opacity: 1 } }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 rounded-t-2xl ring-1 ring-inset ring-[#6c63ff]/40 pointer-events-none"
          />
        </div>

        {/* ── Info strip ── */}
        <motion.div
          variants={{ hover: { backgroundColor: '#1a1a26' } }}
          transition={{ duration: 0.2 }}
          className="p-3 sm:p-4 border-t border-[#2a2a3a]"
        >
          {/* Title */}
          <motion.h3
            variants={{ hover: { color: '#a78bfa' } }}
            transition={{ duration: 0.2 }}
            className="text-white font-semibold text-xs sm:text-sm leading-snug line-clamp-2"
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
                  className="text-[10px] sm:text-xs text-[#6c63ff]/80 font-medium truncate shrink-0"
                >
                  {video.category.name}
                </motion.span>
              )}
              {showCategory && video.category && (
                <span className="text-gray-600 text-xs shrink-0">·</span>
              )}
              <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                {formatDate(video.created_at)}
              </span>
            </div>

            <motion.span
              variants={{ hover: { color: '#e2e8f0' } }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 shrink-0"
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
