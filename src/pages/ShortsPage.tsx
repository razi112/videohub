import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Volume2, VolumeX, Heart, Share2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getThumbnailUrl } from '../lib/youtube'
import type { Video } from '../types'
import toast from 'react-hot-toast'

/* YTPlayer global type is declared in src/types/youtube.d.ts */

/* ── Load YouTube IFrame API once ───────────────────────── */
let ytApiLoaded = false
let ytApiPromise: Promise<void> | null = null

function loadYT(): Promise<void> {
  if (ytApiLoaded) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) { ytApiLoaded = true; resolve(); return }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true
      if (prev) prev()
      resolve()
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  })
  return ytApiPromise
}

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

  /* Init player when this slide becomes active */
  useEffect(() => {
    if (!isActive) {
      // Destroy player when not visible to save resources
      try { playerRef.current?.destroy() } catch { /* noop */ }
      playerRef.current = null
      setReady(false)
      setPlaying(false)
      return
    }

    let destroyed = false

    loadYT().then(() => {
      if (destroyed || !containerRef.current) return
      try { playerRef.current?.destroy() } catch { /* noop */ }
      playerRef.current = null
      setReady(false)

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: video.youtube_video_id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: video.youtube_video_id,
          mute: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (destroyed) return
            setReady(true)
            setPlaying(true)
            e.target.playVideo()
          },
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
    if (playing) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  function toggleMute() {
    if (!playerRef.current) return
    if (muted) { playerRef.current.unMute(); setMuted(false) }
    else { playerRef.current.mute(); setMuted(true) }
  }

  function handleShare() {
    const url = `https://youtu.be/${video.youtube_video_id}`
    if (navigator.share) {
      navigator.share({ title: video.title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() =>
        toast.success('Link copied!', { duration: 2000 })
      )
    }
  }

  /* Touch/swipe handling */
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

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Thumbnail shown until player is ready */}
      {!ready && (
        <img
          src={thumb}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* YouTube iframe — fills the entire slide */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: ready ? 'none' : 'none' }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* ── Right action bar ── */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-20">
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleFavorite(video.id)}
          className="flex flex-col items-center gap-1"
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: liked ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${liked ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.2)'}`,
            }}
          >
            <Heart
              className="w-5 h-5"
              style={{
                color: liked ? '#ef4444' : 'white',
                fill: liked ? '#ef4444' : 'transparent',
              }}
            />
          </div>
          <span className="text-white/70 text-[10px] font-medium">Save</span>
        </motion.button>

        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
          aria-label="Share"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white/70 text-[10px] font-medium">Share</span>
        </motion.button>

        {/* Open in YouTube */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => window.open(`https://youtu.be/${video.youtube_video_id}`, '_blank')}
          className="flex flex-col items-center gap-1"
          aria-label="Open in YouTube"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
          <span className="text-white/70 text-[10px] font-medium">YouTube</span>
        </motion.button>

        {/* Mute / Unmute */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={toggleMute}
          className="flex flex-col items-center gap-1"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: muted ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${muted ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.2)'}`,
            }}
          >
            {muted
              ? <VolumeX className="w-5 h-5 text-[#a78bfa]" />
              : <Volume2 className="w-5 h-5 text-white" />
            }
          </div>
          <span className="text-white/70 text-[10px] font-medium">{muted ? 'Unmuted' : 'Mute'}</span>
        </motion.button>
      </div>

      {/* ── Bottom info ── */}
      <div className="absolute bottom-20 left-4 right-20 z-20">
        {video.category && (
          <span
            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2"
            style={{
              background: 'rgba(108,99,255,0.3)',
              border: '1px solid rgba(108,99,255,0.5)',
              color: '#c4b5fd',
            }}
          >
            {video.category.name}
          </span>
        )}
        <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow-lg">
          {video.title}
        </h2>
      </div>

      {/* ── Centre play/pause indicator (tap feedback) ── */}
      <AnimatePresence>
        {!playing && ready && (
          <motion.div
            key="pause-icon"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation arrows (desktop hint) ── */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 z-20 w-10 h-10 rounded-full items-center justify-center text-white/60 hover:text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)' }}
          aria-label="Previous"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-4 z-20 w-10 h-10 rounded-full items-center justify-center text-white/60 hover:text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)' }}
          aria-label="Next"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

/* ── Main ShortsPage ──────────────────────────────────────── */
export default function ShortsPage() {
  const { videos } = useStore()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Use all published videos as shorts feed
  const feed: Video[] = videos.filter(v => v.status === 'published')

  function goNext() {
    if (activeIndex < feed.length - 1) {
      setDirection(1)
      setActiveIndex(i => i + 1)
    }
  }

  function goPrev() {
    if (activeIndex > 0) {
      setDirection(-1)
      setActiveIndex(i => i - 1)
    }
  }

  /* Keyboard navigation */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, feed.length])

  /* Wheel scroll navigation */
  const wheelLock = useRef(false)
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (wheelLock.current) return
    wheelLock.current = true
    setTimeout(() => { wheelLock.current = false }, 600)
    if (e.deltaY > 0) goNext()
    else if (e.deltaY < 0) goPrev()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, feed.length])

  if (feed.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}
          >
            <Play className="w-7 h-7 text-[#a78bfa]" />
          </div>
          <p className="text-white/50 text-sm font-medium">No videos available</p>
        </div>
      </div>
    )
  }

  const variants = {
    enter: (dir: number) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { y: '0%', opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    /* Full screen container — overrides PublicLayout padding */
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ zIndex: 1 }}
      onWheel={onWheel}
    >
      {/* Progress dots (right side) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 hidden md:flex">
        {feed.slice(Math.max(0, activeIndex - 3), activeIndex + 4).map((_, i) => {
          const realIndex = Math.max(0, activeIndex - 3) + i
          return (
            <motion.button
              key={realIndex}
              onClick={() => {
                setDirection(realIndex > activeIndex ? 1 : -1)
                setActiveIndex(realIndex)
              }}
              animate={{ scale: realIndex === activeIndex ? 1.3 : 1, opacity: realIndex === activeIndex ? 1 : 0.35 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: realIndex === activeIndex ? '#a78bfa' : 'white' }}
            />
          )
        })}
      </div>

      {/* Counter badge */}
      <div
        className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full text-xs font-semibold text-white/60"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
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

      {/* Swipe hint — shown only first visit */}
      <AnimatePresence>
        {activeIndex === 0 && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none md:hidden"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronUp className="w-5 h-5 text-white/50" />
            </motion.div>
            <span className="text-white/40 text-[10px] font-medium tracking-wide">Swipe up</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
