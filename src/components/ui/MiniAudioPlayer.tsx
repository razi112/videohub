import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward, X,
  Music2, ChevronUp, ChevronDown,
} from 'lucide-react'
import { useAudioPlayer } from '../../store/useAudioPlayer'
import { getThumbnailUrl } from '../../lib/youtube'

/* ─────────────────────────────────────────────────────────────
   YouTube IFrame API types (minimal)
───────────────────────────────────────────────────────────── */
declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (e: { target: YTPlayer }) => void
            onStateChange?: (e: { data: number }) => void
            onError?: (e: { data: number }) => void
          }
        }
      ) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  loadVideoById(id: string): void
  cueVideoById(id: string): void
  getCurrentTime(): number
  getDuration(): number
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getPlayerState(): number
  destroy(): void
}

/* ─────────────────────────────────────────────────────────────
   Load YouTube IFrame API once
───────────────────────────────────────────────────────────── */
import { loadYTApi } from '../../lib/ytApi'

/* ─────────────────────────────────────────────────────────────
   Format seconds → m:ss
───────────────────────────────────────────────────────────── */
function fmt(s: number) {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */
export default function MiniAudioPlayer() {
  const { currentVideo, isPlaying, isVisible, next, prev, close, setPlaying } = useAudioPlayer()

  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number>(0)

  const [ready, setReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [seeking, setSeeking] = useState(false)

  const thumb = currentVideo
    ? currentVideo.thumbnail_url || getThumbnailUrl(currentVideo.youtube_video_id, 'medium')
    : ''

  /* ── Init YT player once ───────────────────────────────── */
  useEffect(() => {
    if (!currentVideo) return
    let destroyed = false

    loadYTApi().then(() => {
      if (destroyed || !containerRef.current) return

      // Destroy previous instance
      try { playerRef.current?.destroy() } catch { /* ignore */ }
      playerRef.current = null
      setReady(false)
      setCurrentTime(0)
      setDuration(0)

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: currentVideo.youtube_video_id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (destroyed) return
            setReady(true)
            setDuration(e.target.getDuration())
            if (isPlaying) e.target.playVideo()
          },
          onStateChange: (e) => {
            if (destroyed) return
            const YTState = window.YT.PlayerState
            if (e.data === YTState.PLAYING) {
              setPlaying(true)
              setDuration(playerRef.current?.getDuration() ?? 0)
            } else if (e.data === YTState.PAUSED) {
              setPlaying(false)
            } else if (e.data === YTState.ENDED) {
              next()
            }
          },
          onError: () => { if (!destroyed) next() },
        },
      })
    })

    return () => { destroyed = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.youtube_video_id])

  /* ── Sync play/pause ───────────────────────────────────── */
  useEffect(() => {
    if (!ready || !playerRef.current) return
    if (isPlaying) playerRef.current.playVideo()
    else playerRef.current.pauseVideo()
  }, [isPlaying, ready])

  /* ── Progress ticker ───────────────────────────────────── */
  const tick = useCallback(() => {
    if (playerRef.current && !seeking) {
      setCurrentTime(playerRef.current.getCurrentTime() ?? 0)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [seeking])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  /* ── Seek ───────────────────────────────────────────────── */
  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    setCurrentTime(val)
    playerRef.current?.seekTo(val, true)
  }

  /* ── Don't render if nothing loaded ─────────────────────── */
  if (!currentVideo) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="mini-player"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 38 }}
          className="fixed inset-x-0 z-[60]"
          style={{
            /* sits above bottom nav on mobile, above viewport edge on desktop */
            bottom: 'calc(62px + env(safe-area-inset-bottom))',
          }}
        >
          {/* ── Expanded full panel ─────────────────────── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="mx-3 mb-2 rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(8,8,20,0.92)',
                  backdropFilter: 'blur(40px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 -8px 48px rgba(0,0,0,0.6)',
                }}
              >
                {/* Album art header */}
                <div className="relative">
                  <img
                    src={thumb}
                    alt={currentVideo.title}
                    className="w-full aspect-video object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08081480]" />
                  {/* Purple ambient glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff]/20 to-transparent pointer-events-none" />
                  {/* Music icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(108,99,255,0.2)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(108,99,255,0.4)',
                        boxShadow: '0 0 40px rgba(108,99,255,0.3)',
                      }}
                    >
                      <Music2 className="w-9 h-9 text-[#a78bfa]" />
                    </div>
                  </div>
                </div>

                {/* Controls area */}
                <div className="px-5 pt-4 pb-5">
                  {/* Title */}
                  <p className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-1">
                    {currentVideo.title}
                  </p>
                  {currentVideo.category && (
                    <p className="text-[#a78bfa]/70 text-xs mb-4">{currentVideo.category.name}</p>
                  )}

                  {/* Seek bar */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onMouseDown={() => setSeeking(true)}
                      onTouchStart={() => setSeeking(true)}
                      onMouseUp={() => setSeeking(false)}
                      onTouchEnd={() => setSeeking(false)}
                      onChange={handleSeek}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #a78bfa ${progress}%, rgba(255,255,255,0.12) ${progress}%)`,
                        accentColor: '#a78bfa',
                      }}
                    />
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-white/35">{fmt(currentTime)}</span>
                      <span className="text-[10px] text-white/35">{fmt(duration)}</span>
                    </div>
                  </div>

                  {/* Playback controls */}
                  <div className="flex items-center justify-center gap-6">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={prev}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-white transition-colors"
                      aria-label="Previous"
                    >
                      <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => useAudioPlayer.getState().togglePlay()}
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                        boxShadow: '0 4px 20px rgba(108,99,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                      }}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying
                        ? <Pause className="w-6 h-6 text-white fill-white" />
                        : <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      }
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={next}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-white transition-colors"
                      aria-label="Next"
                    >
                      <SkipForward className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mini bar (always visible when player is open) ── */}
          <div
            className="mx-3 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(8,8,20,0.9)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Progress line at top */}
            <div className="h-[2px] bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6c63ff, #a78bfa)',
                }}
              />
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5">
              {/* Thumbnail */}
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <img src={thumb} alt={currentVideo.title} className="w-full h-full object-cover" />
                {/* Animated pulse when playing */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: 'rgba(108,99,255,0.35)' }}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Music2 className="w-4 h-4 text-white/80 drop-shadow" />
                </div>
              </div>

              {/* Title — tap to expand */}
              <button
                className="flex-1 min-w-0 text-left"
                onClick={() => setExpanded(e => !e)}
              >
                <p className="text-white/90 text-xs font-semibold line-clamp-1">{currentVideo.title}</p>
                <p className="text-white/35 text-[10px] mt-0.5">{fmt(currentTime)} / {fmt(duration)}</p>
              </button>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={prev}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors"
                  aria-label="Previous"
                >
                  <SkipBack className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => useAudioPlayer.getState().togglePlay()}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                    boxShadow: '0 2px 12px rgba(108,99,255,0.4)',
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying
                    ? <Pause className="w-4 h-4 text-white fill-white" />
                    : <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  }
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={next}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors"
                  aria-label="Next"
                >
                  <SkipForward className="w-4 h-4" />
                </motion.button>

                {/* Expand / Collapse */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setExpanded(e => !e)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white transition-colors"
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                  {expanded
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronUp className="w-4 h-4" />
                  }
                </motion.button>

                {/* Close */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={close}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-red-400 transition-colors"
                  aria-label="Close player"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Hidden YouTube iframe — audio source */}
          <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
            <div ref={containerRef} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
