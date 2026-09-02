import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Volume2, VolumeX, Heart, Share2, ExternalLink,
  ChevronUp, ChevronDown, ArrowLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getThumbnailUrl } from '../lib/youtube'
import { loadYTApi } from '../lib/ytApi'
import type { Video } from '../types'
import toast from 'react-hot-toast'

/* ── Single short video slide ───────────────────────────── */
interface ShortSlideProps {
  video: Video
  isActive: boolean
  onNext: () => void
  onPrev: () => void
  hasNext: boolean
  hasPrev: boolean
}

function ShortSlide({ video, isActive, onNext, onPrev, hasNext, hasPrev }: ShortSlideProps) {
  const { toggleFavorite, isFavorite } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [ready, setReady] = useState(false)
  const liked = isFavorite(video.id)
  const thumb = video.thumbnail_url || getThumbnailUrl(video.youtube_video_id, 'high')

  useEffect(() => {
    if (!isActive) {
      try { playerRef.current?.destroy() } catch { /* noop */ }
      playerRef.current = null
      setReady(false)
      setPlaying(false)
      return
    }
    let destroyed = false
    loadYTApi().then(() => {
      if (destroyed || !containerRef.current) return
      try { playerRef.current?.destroy() } catch { /* noop */ }
      playerRef.current = null
      setReady(false)
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: video.youtube_video_id,
        playerVars: {
          autoplay: 1, controls: 0, disablekb: 1, fs: 0,
          iv_load_policy: 3, modestbranding: 1, playsinline: 1,
          rel: 0, loop: 1, playlist: video.youtube_video_id,
          mute: 0, origin: window.location.origin,
        },
        events: {
          onReady: (e) => { if (destroyed) return; setReady(true); setPlaying(true); e.target.playVideo() },
          onStateChange: (e) => {
            if (destroyed) return
            const { PLAYING, PAUSED } = window.YT.PlayerState
            if (e.data === PLAYING) setPlaying(true)
            else if (e.data === PAUSED) setPlaying(false)
          },
          onError: () => { if (!destroyed) onNext() },
        },
      })
    })
    return () => { destroyed = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, video.youtube_video_id])

  function togglePlay() {
    if (!playerRef.current || !ready) return
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  function toggleMute() {
    if (!playerRef.current) return
    if (muted) { playerRef.current.unMute(); setMuted(false) }
    else { playerRef.current.mute(); setMuted(true) }
  }

  function handleShare() {
    const url = `https://youtu.be/${video.youtube_video_id}`
    if (navigator.share) navigator.share({ title: video.title, url }).catch(() => {})
    else navigator.clipboard.writeText(url).then(() => toast.success('Link copied!', { duration: 2000 }))
  }

  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dy = touchStartY.current - e.changedTouches[0].clientY
    const dt = Date.now() - touchStartTime.current
    const isSwipe = Math.abs(dy) > 50 && dt < 400
    if (!isSwipe) { togglePlay(); return }
    if (dy > 0 && hasNext) onNext()
    else if (dy < 0 && hasPrev) onPrev()
  }

  // Shared action button style
  const actionBtn = (active = false, activeColor = 'rgba(239,68,68,0.25)', activeBorder = 'rgba(239,68,68,0.5)') => ({
    background: active ? activeColor : 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${active ? activeBorder : 'rgba(255,255,255,0.2)'}`,
  })

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Thumbnail until player ready */}
      {!ready && (
        <img src={thumb} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* YouTube iframe */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* ── Right action bar ── */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-20">
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleFavorite(video.id)}
          className="flex flex-col items-center gap-1" aria-label={liked ? 'Unlike' : 'Like'}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={actionBtn(liked, 'rgba(239,68,68,0.25)', 'rgba(239,68,68,0.5)')}>
            <Heart className="w-5 h-5" style={{ color: liked ? '#ef4444' : 'white', fill: liked ? '#ef4444' : 'transparent' }} />
          </div>
          <span className="text-white/70 text-[10px] font-medium">Save</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.8 }} onClick={handleShare}
          className="flex flex-col items-center gap-1" aria-label="Share">
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={actionBtn()}>
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white/70 text-[10px] font-medium">Share</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.8 }}
          onClick={() => window.open(`https://youtu.be/${video.youtube_video_id}`, '_blank')}
          className="flex flex-col items-center gap-1" aria-label="Open in YouTube">
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={actionBtn()}>
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
          <span className="text-white/70 text-[10px] font-medium">YouTube</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.8 }} onClick={toggleMute}
          className="flex flex-col items-center gap-1" aria-label={muted ? 'Unmute' : 'Mute'}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={actionBtn(muted, 'rgba(167,139,250,0.2)', 'rgba(167,139,250,0.4)')}>
            {muted ? <VolumeX className="w-5 h-5 text-[#a78bfa]" /> : <Volume2 className="w-5 h-5 text-white" />}
          </div>
          <span className="text-white/70 text-[10px] font-medium">{muted ? 'Unmuted' : 'Mute'}</span>
        </motion.button>
      </div>

      {/* ── Bottom info ── */}
      <div className="absolute bottom-20 left-4 right-20 z-20">
        {video.category && (
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2"
            style={{ background: 'rgba(108,99,255,0.3)', border: '1px solid rgba(108,99,255,0.5)', color: '#c4b5fd' }}>
            {video.category.name}
          </span>
        )}
        <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow-lg">
          {video.title}
        </h2>
      </div>

      {/* ── Centre play/pause indicator ── */}
      <AnimatePresence>
        {!playing && ready && (
          <motion.div key="pause-icon"
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }} transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav arrows — shown inside card on desktop only when needed */}
      {hasPrev && (
        <button onClick={onPrev}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-3 z-20 w-9 h-9 rounded-full items-center justify-center text-white/70 hover:text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}
          aria-label="Previous">
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      {hasNext && (
        <button onClick={onNext}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-3 z-20 w-9 h-9 rounded-full items-center justify-center text-white/70 hover:text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}
          aria-label="Next">
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/* ── Main ShortsPage ──────────────────────────────────────── */
export default function ShortsPage() {
  const { videos } = useStore()
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const feed = useMemo(
    () => videos.filter(v => v.status === 'published' && v.is_short === true),
    [videos]
  )

  const goNext = useCallback(() => {
    if (activeIndex < feed.length - 1) { setDirection(1); setActiveIndex(i => i + 1) }
  }, [activeIndex, feed.length])

  const goPrev = useCallback(() => {
    if (activeIndex > 0) { setDirection(-1); setActiveIndex(i => i - 1) }
  }, [activeIndex])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, feed.length])

  const wheelLock = useRef(false)
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (wheelLock.current) return
    wheelLock.current = true
    setTimeout(() => { wheelLock.current = false }, 600)
    if (e.deltaY > 0) goNext()
    else if (e.deltaY < 0) goPrev()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, feed.length])

  const variants = {
    enter: (dir: number) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { y: '0%', opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  /* ── Back button (shared between mobile + desktop) ── */
  const BackButton = () => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="flex items-center gap-2 z-50"
      style={{
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: '999px',
        padding: '8px 16px 8px 10px',
        color: 'rgba(255,255,255,0.9)',
      }}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-medium">Back</span>
    </motion.button>
  )

  if (feed.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-40">
        {/* Back button — empty state */}
        <div className="absolute top-5 left-5">
          <BackButton />
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}>
            <Play className="w-7 h-7 text-[#a78bfa]" />
          </div>
          <p className="text-white/50 text-sm font-medium">No shorts available</p>
          <p className="text-white/25 text-xs mt-1">Mark videos as "Short" in the admin panel</p>
        </div>
      </div>
    )
  }

  return (
    /* Full-screen on all screen sizes — header/sidebar already hidden by PublicLayout */
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ zIndex: 10 }}
      onWheel={onWheel}
    >
      {/* Back button — top-left */}
      <div className="absolute top-5 left-4 z-50">
        <BackButton />
      </div>

      {/* Progress dots — right edge */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5">
        {feed.slice(Math.max(0, activeIndex - 3), activeIndex + 4).map((_, i) => {
          const ri = Math.max(0, activeIndex - 3) + i
          return (
            <motion.button
              key={ri}
              onClick={() => { setDirection(ri > activeIndex ? 1 : -1); setActiveIndex(ri) }}
              animate={{ scale: ri === activeIndex ? 1.3 : 1, opacity: ri === activeIndex ? 1 : 0.35 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ri === activeIndex ? '#a78bfa' : 'white' }}
            />
          )
        })}
      </div>

      {/* Counter badge */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full text-xs font-semibold text-white/60 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {activeIndex + 1} / {feed.length}
      </div>

      {/* Slide */}
      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.div
          key={feed[activeIndex]?.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 350, damping: 38, mass: 0.8 }}
          className="absolute inset-0"
        >
          <ShortSlide
            video={feed[activeIndex]}
            isActive={true}
            onNext={goNext}
            onPrev={goPrev}
            hasNext={activeIndex < feed.length - 1}
            hasPrev={activeIndex > 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Swipe hint — mobile only */}
      <AnimatePresence>
        {activeIndex === 0 && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronUp className="w-5 h-5 text-white/50" />
            </motion.div>
            <span className="text-white/40 text-[10px] font-medium tracking-wide">Swipe up</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
