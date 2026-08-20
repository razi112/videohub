import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Share2, ExternalLink, ArrowLeft, Eye, Calendar, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import { getEmbedUrl, getWatchUrl } from '../lib/youtube'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { videos, toggleFavorite, isFavorite, updateVideo } = useStore()
  const [embedError, setEmbedError] = useState(false)

  const video = useMemo(() => videos.find((v) => v.id === id), [videos, id])
  const relatedVideos = useMemo(() =>
    videos
      .filter((v) => v.id !== id && v.status === 'published' && v.category_id === video?.category_id)
      .slice(0, 6),
    [videos, id, video]
  )

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 text-center text-gray-500">
        <p className="text-4xl mb-3">🎬</p>
        <p className="text-lg sm:text-xl font-semibold text-gray-300">Video not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#6c63ff] hover:underline text-sm">
          Go back
        </button>
      </div>
    )
  }

  const favorite = isFavorite(video.id)

  const handleFavorite = () => {
    toggleFavorite(video.id)
    toast.success(favorite ? 'Removed from saved' : 'Video saved!')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  const handleLoad = () => {
    updateVideo(video.id, { views: video.views + 1 })
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

        {/* ── Main ── */}
        <div className="lg:col-span-2 min-w-0">

          {/* Player */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-[#2a2a3a] shadow-2xl shadow-black/50"
          >
            {!embedError ? (
              <div className="relative aspect-video">
                <iframe
                  src={getEmbedUrl(video.youtube_video_id, { rel: false })}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onLoad={handleLoad}
                  onError={() => setEmbedError(true)}
                />
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center bg-[#111118] text-gray-500 px-4 text-center">
                <p className="text-base sm:text-lg font-semibold mb-2">⚠️ Video unavailable</p>
                <p className="text-xs sm:text-sm mb-4">This video cannot be played here.</p>
                <a
                  href={getWatchUrl(video.youtube_video_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  Watch on YouTube
                </a>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 sm:mt-6"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
              {video.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
              {video.category && (
                <Link
                  to="/categories"
                  className="flex items-center gap-1 text-[#a78bfa] hover:text-[#6c63ff] transition-colors"
                >
                  <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  {video.category.name}
                </Link>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                {video.views.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                {new Date(video.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-5 pb-4 sm:pb-5 border-b border-[#2a2a3a]">
              <button
                onClick={handleFavorite}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  favorite
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                    : 'bg-[#16161e] border-[#2a2a3a] text-gray-400 hover:border-[#6c63ff]/40 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${favorite ? 'fill-red-400' : ''}`} />
                {favorite ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-[#2a2a3a] bg-[#16161e] text-gray-400 hover:text-white hover:border-[#6c63ff]/40 text-xs sm:text-sm font-medium transition-all"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Share
              </button>

              <a
                href={getWatchUrl(video.youtube_video_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-[#2a2a3a] bg-[#16161e] text-gray-400 hover:text-white hover:border-red-500/40 text-xs sm:text-sm font-medium transition-all sm:ml-auto"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                YouTube
              </a>
            </div>

            {/* Description */}
            {video.description && (
              <div className="mt-4 sm:mt-5">
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                {video.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#16161e] border border-[#2a2a3a] rounded-full text-xs text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Related Videos ── */}
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Related Videos</h3>
          {relatedVideos.length === 0 ? (
            <p className="text-gray-500 text-sm">No related videos found.</p>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              {relatedVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
