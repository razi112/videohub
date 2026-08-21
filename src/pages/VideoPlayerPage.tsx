import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, Share2, ExternalLink, ArrowLeft, Eye, Calendar, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import { getEmbedUrl, getWatchUrl } from '../lib/youtube'
import { useMemo, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

async function checkEmbeddable(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    return res.ok
  } catch { return true }
}

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const autoplay = searchParams.get('autoplay') === '1'
  const { videos, toggleFavorite, isFavorite, updateVideo } = useStore()
  const [embedStatus, setEmbedStatus] = useState<'checking' | 'ok' | 'blocked'>('checking')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loadedRef = useRef(false)

  const video = useMemo(() => videos.find((v) => v.id === id), [videos, id])
  const relatedVideos = useMemo(() =>
    videos.filter((v) => v.id !== id && v.status === 'published' && v.category_id === video?.category_id).slice(0, 6),
    [videos, id, video]
  )

  useEffect(() => {
    if (!video) return
    setEmbedStatus('checking')
    loadedRef.current = false
    checkEmbeddable(video.youtube_video_id).then(ok => setEmbedStatus(ok ? 'ok' : 'blocked'))
  }, [video?.youtube_video_id])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.origin.includes('youtube')) return
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        if (data?.event === 'infoDelivery' && data?.info?.playerState === 0) return
        if (data?.event === 'onError' || (data?.info?.error && [100, 101, 150].includes(data.info.error))) {
          setEmbedStatus('blocked')
        }
      } catch { /* ignore */ }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">🎬</p>
        <p className="text-lg font-semibold text-white/60">Video not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#a78bfa] hover:text-white text-sm transition-colors">← Go back</button>
      </div>
    )
  }

  const favorite = isFavorite(video.id)
  const handleFavorite = () => { toggleFavorite(video.id); toast.success(favorite ? 'Removed from saved' : 'Video saved!') }
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }
  const handleIframeLoad = () => {
    if (!loadedRef.current) { loadedRef.current = true; updateVideo(video.id, { views: video.views + 1 }) }
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/40 hover:text-white mb-5 transition-colors text-sm group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
        Back
      </button>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ── Main ── */}
        <div className="flex-1 min-w-0">

          {/* Player */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden w-full shadow-2xl shadow-black/50">
            {/* Rim glow */}
            <div className="absolute -inset-px rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.08] via-transparent to-[#6c63ff]/10 pointer-events-none z-10" />

            {embedStatus === 'blocked' ? (
              <div className="aspect-video flex flex-col items-center justify-center glass text-white/40 px-6 text-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${video.thumbnail_url})` }} />
                <div>
                  <p className="text-base sm:text-lg font-semibold text-white/70 mb-1">Embedding disabled</p>
                  <p className="text-xs sm:text-sm text-white/30">The video owner has disabled playback on external sites.</p>
                </div>
                <a href={getWatchUrl(video.youtube_video_id)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-500/80 hover:bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all">
                  <ExternalLink className="w-4 h-4 shrink-0" /> Watch on YouTube
                </a>
              </div>
            ) : (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {embedStatus === 'checking' && <div className="absolute inset-0 glass animate-pulse" />}
                <iframe ref={iframeRef}
                  src={embedStatus !== 'checking' ? getEmbedUrl(video.youtube_video_id, { rel: false, autoplay, mute: autoplay }) : undefined}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen onLoad={handleIframeLoad}
                />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 sm:mt-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">{video.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 text-xs sm:text-sm text-white/35">
              {video.category && (
                <Link to="/categories" className="flex items-center gap-1 text-[#a78bfa]/70 hover:text-[#a78bfa] transition-colors">
                  <Tag className="w-3 h-3 shrink-0" /> {video.category.name}
                </Link>
              )}
              <span className="flex items-center gap-1"><Eye className="w-3 h-3 shrink-0" />{video.views.toLocaleString()} views</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 shrink-0" />
                {new Date(video.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-5 pb-5 border-b border-white/[0.06]">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleFavorite}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  favorite ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'glass text-white/50 hover:text-white'
                }`}>
                <Heart className={`w-3.5 h-3.5 shrink-0 ${favorite ? 'fill-red-400' : ''}`} />
                {favorite ? 'Saved' : 'Save'}
              </motion.button>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 glass rounded-full text-white/50 hover:text-white text-xs sm:text-sm font-medium transition-all">
                <Share2 className="w-3.5 h-3.5 shrink-0" /> Share
              </motion.button>

              <a href={getWatchUrl(video.youtube_video_id)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 glass rounded-full text-white/50 hover:text-red-400 text-xs sm:text-sm font-medium transition-all sm:ml-auto">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" /> YouTube
              </a>
            </div>

            {/* Description */}
            {video.description && (
              <p className="mt-4 sm:mt-5 text-white/40 text-xs sm:text-sm leading-relaxed whitespace-pre-line">{video.description}</p>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                {video.tags.map((tag) => (
                  <span key={tag} className="px-3 py-0.5 glass rounded-full text-xs text-white/35">#{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Related ── */}
        <div className="lg:w-72 xl:w-80 shrink-0 min-w-0">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Related</h3>
          {relatedVideos.length === 0 ? (
            <p className="text-white/25 text-sm">No related videos found.</p>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {relatedVideos.map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
