import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Heart, Share2, ExternalLink, ArrowLeft, Eye, Calendar, Tag,
  Headphones, Video as VideoIcon, Play, Pause, SkipBack, SkipForward, Music2,
  Download, CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import { getEmbedUrl, getWatchUrl, getThumbnailUrl } from '../lib/youtube'
import { useMemo, useState, useEffect, useRef, useCallback, useId } from 'react'
import toast from 'react-hot-toast'
import { useAudioPlayer } from '../store/useAudioPlayer'
import { loadYTApi } from '../lib/ytApi'

/* YTPlayer global type is declared in src/types/youtube.d.ts */

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/** Convert "H:MM:SS" or "M:SS" duration string to total seconds */
function parseDurationToSeconds(dur: string): number {
  const parts = dur.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return Number(dur) || 0
}

// Module-level cache — survives navigation, cleared only on page reload
const embedCache = new Map<string, boolean>()

async function checkEmbeddable(videoId: string): Promise<boolean> {
  if (embedCache.has(videoId)) return embedCache.get(videoId)!
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    const ok = res.ok
    embedCache.set(videoId, ok)
    return ok
  } catch {
    embedCache.set(videoId, true)
    return true
  }
}

/* ── LinkifiedText — renders plain text with URLs as clickable links ── */
const URL_RE = /(\bhttps?:\/\/[^\s<>)"']+)/g

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(URL_RE)
  return (
    <>
      {parts.map((part, i) =>
        /^\bhttps?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a78bfa] hover:text-white underline underline-offset-2 break-all transition-colors"
            onClick={e => e.stopPropagation()}
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  )
}

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const autoplay = searchParams.get('autoplay') === '1'

  const { videos, toggleFavorite, isFavorite, updateVideo, toggleDownload, isDownloaded, updateWatchProgress } = useStore()
  const audioStore = useAudioPlayer()

  const [embedStatus, setEmbedStatus] = useState<'checking' | 'ok' | 'blocked'>('checking')
  const [audioMode, setAudioMode] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const ytPlayerRef = useRef<YTPlayer | null>(null)
  const rafRef = useRef<number>(0)
  const loadedRef = useRef(false)
  const iframeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Stable DOM id for the hidden YT player div
  const rawId = useId()
  const ytDivId = `yt-audio-${rawId.replace(/:/g, '')}`

  const video = useMemo(() => videos.find((v) => v.id === id), [videos, id])
  const relatedVideos = useMemo(() =>
    videos
      .filter((v) => v.id !== id && v.status === 'published' && v.category_id === video?.category_id)
      .slice(0, 6),
    [videos, id, video]
  )

  const thumbnail = video
    ? video.thumbnail_url || getThumbnailUrl(video.youtube_video_id, 'maxres')
    : ''

  /* ── Embeddability check ── */
  useEffect(() => {
    if (!video) return
    setEmbedStatus('checking')
    loadedRef.current = false
    checkEmbeddable(video.youtube_video_id).then(ok => setEmbedStatus(ok ? 'ok' : 'blocked'))
  }, [video?.youtube_video_id])

  /* ── YouTube postMessage: video end → next, errors → blocked ── */
  useEffect(() => {
    if (audioMode) return // audio mode has its own player
    const handler = (e: MessageEvent) => {
      if (!e.origin.includes('youtube')) return
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data

        // Detect embed errors
        if (data?.event === 'onError' || (data?.info?.error && [100, 101, 150].includes(data.info.error))) {
          setEmbedStatus('blocked')
          return
        }

        // playerState 0 = ended → mark completed, navigate to next
        if (
          (data?.event === 'infoDelivery' && data?.info?.playerState === 0) ||
          (data?.event === 'onStateChange' && data?.info === 0)
        ) {
          if (video) updateWatchProgress(video.id, video.duration ? parseDurationToSeconds(video.duration) : 0, true)
          if (relatedVideos.length > 0) {
            navigate(`/videos/${relatedVideos[0].id}?autoplay=1`)
          }
        }
      } catch { /* ignore */ }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [audioMode, relatedVideos, navigate])

  /* ── Init in-page YT player when audio mode turns on ── */
  useEffect(() => {
    if (!audioMode || !video) return
    let destroyed = false

    // Destroy any previous instance first
    try { ytPlayerRef.current?.destroy() } catch { /* ignore */ }
    ytPlayerRef.current = null
    setAudioReady(false)
    setAudioPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    loadYTApi().then(() => {
      if (destroyed) return

      // The div must already be in the DOM — we pass its id string
      ytPlayerRef.current = new window.YT.Player(ytDivId, {
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
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (destroyed) return
            setAudioReady(true)
            setDuration(e.target.getDuration() || 0)
            e.target.playVideo()
            setAudioPlaying(true)
          },
          onStateChange: (e) => {
            if (destroyed) return
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setAudioPlaying(true)
              setDuration(ytPlayerRef.current?.getDuration() ?? 0)
            } else if (e.data === S.PAUSED) {
              setAudioPlaying(false)
            } else if (e.data === S.ENDED) {
              setAudioPlaying(false)
            }
          },
          onError: () => {
            if (!destroyed) toast.error('Audio unavailable for this video')
          },
        },
      })
    })

    return () => {
      destroyed = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioMode, video?.youtube_video_id, ytDivId])

  /* ── Destroy YT player when leaving audio mode or unmounting ── */
  useEffect(() => {
    if (audioMode) return // active — don't destroy
    cancelAnimationFrame(rafRef.current)
    try { ytPlayerRef.current?.destroy() } catch { /* ignore */ }
    ytPlayerRef.current = null
  }, [audioMode])

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(iframeTimerRef.current)
    try { ytPlayerRef.current?.destroy() } catch { /* ignore */ }
  }, [])

  /* ── RAF progress ticker ── */
  const tick = useCallback(() => {
    if (ytPlayerRef.current && !seeking) {
      try { setCurrentTime(ytPlayerRef.current.getCurrentTime() ?? 0) } catch { /* ignore */ }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [seeking])

  useEffect(() => {
    if (!audioMode) { cancelAnimationFrame(rafRef.current); return }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [audioMode, tick])

  /* ── Not found ── */
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

  /* ── Download (in-app save) ── */
  const downloaded = isDownloaded(video.id)
  const handleDownload = () => {
    toggleDownload(video.id)
    toast.success(downloaded ? 'Removed from downloads' : 'Saved to downloads!')
  }

  const ytUrl = getWatchUrl(video.youtube_video_id)
  const handleIframeLoad = () => {
    if (!loadedRef.current) {
      loadedRef.current = true
      updateVideo(video.id, { views: video.views + 1 })
      // Record this video in watch history the moment the player loads
      updateWatchProgress(video.id, 0, false)
    }
    // Send unmute + set volume after iframe is ready so autoplay starts with sound
    iframeTimerRef.current = setTimeout(() => {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
          '*'
        )
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
          '*'
        )
      } catch { /* ignore */ }
    }, 800)
  }

  function toggleAudioMode() {
    if (!audioMode) {
      setAudioMode(true)
      // Also feed global mini player queue so it continues if user navigates away
      audioStore.playVideo(video!, [video!, ...relatedVideos])
    } else {
      setAudioMode(false)
    }
  }

  function toggleInPagePlay() {
    if (!ytPlayerRef.current || !audioReady) return
    if (audioPlaying) {
      ytPlayerRef.current.pauseVideo()
    } else {
      ytPlayerRef.current.playVideo()
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    setCurrentTime(val)
    ytPlayerRef.current?.seekTo(val, true)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

      {/* ── Hidden YT audio div — always in DOM so the API can target it by id ── */}
      <div
        id={ytDivId}
        style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Back */}
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white transition-colors"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        Back
      </motion.button>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ── Main ── */}
        <div className="flex-1 min-w-0">

          {/* Player area */}
          <AnimatePresence mode="wait">

            {/* VIDEO MODE */}
            {!audioMode && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden w-full shadow-2xl shadow-black/50"
              >
                <div className="absolute -inset-px rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.08] via-transparent to-[#6c63ff]/10 pointer-events-none z-10" />
                {embedStatus === 'blocked' ? (
                  <div className="aspect-video flex flex-col items-center justify-center glass text-white/40 px-6 text-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${thumbnail})` }} />
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
                      src={embedStatus !== 'checking' ? getEmbedUrl(video.youtube_video_id, { rel: false, autoplay }) : undefined}
                      title={video.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen onLoad={handleIframeLoad}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* AUDIO / MP3 MODE */}
            {audioMode && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden w-full shadow-2xl shadow-black/60 aspect-video flex flex-col items-center justify-center"
                style={{ background: 'rgba(8,8,20,0.97)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                {/* Blurred bg */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img src={thumbnail} alt="" className="w-full h-full object-cover opacity-20 scale-110" style={{ filter: 'blur(32px)' }} aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#08081480] via-[#080814cc] to-[#080814ee]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff]/12 to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col items-center px-6 w-full">

                  {/* Spinning vinyl */}
                  <div className="relative mb-5">
                    <motion.div
                      animate={audioPlaying ? { rotate: 360 } : {}}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-4 rounded-full pointer-events-none"
                      style={{ background: 'conic-gradient(from 0deg, #6c63ff33, #a78bfa66, #6c63ff33)', filter: 'blur(12px)' }}
                    />
                    <motion.div
                      animate={audioPlaying ? { rotate: 360 } : {}}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden"
                      style={{
                        border: '3px solid rgba(108,99,255,0.45)',
                        boxShadow: '0 0 40px rgba(108,99,255,0.3), 0 8px 32px rgba(0,0,0,0.6)',
                      }}
                    >
                      {/* Image fills the full circle regardless of thumbnail aspect ratio */}
                      <img
                        src={thumbnail}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-full"
                      />
                      {/* Centre hole */}
                      <div className="absolute inset-0 m-auto rounded-full" style={{ width: '22%', height: '22%', background: 'rgba(8,8,20,0.95)', border: '2px solid rgba(108,99,255,0.5)' }} />
                    </motion.div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', boxShadow: '0 3px 12px rgba(108,99,255,0.5)' }}>
                      <Music2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-white font-bold text-sm sm:text-base text-center line-clamp-2 leading-snug mb-0.5 px-2">{video.title}</p>
                  {video.category && <p className="text-[#a78bfa]/70 text-[11px] mb-3">{video.category.name}</p>}

                  {/* Loading */}
                  {!audioReady && (
                    <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-white/40 text-[11px] mb-3">
                      Loading audio…
                    </motion.p>
                  )}

                  {/* Seek bar */}
                  <div className="w-full max-w-xs mb-1">
                    <input type="range" min={0} max={duration || 100} value={currentTime}
                      onMouseDown={() => setSeeking(true)} onTouchStart={() => setSeeking(true)}
                      onMouseUp={() => setSeeking(false)} onTouchEnd={() => setSeeking(false)}
                      onChange={handleSeek}
                      disabled={!audioReady}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-30"
                      style={{ background: `linear-gradient(to right, #a78bfa ${progress}%, rgba(255,255,255,0.12) ${progress}%)`, accentColor: '#a78bfa' }}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-white/35">{fmt(currentTime)}</span>
                      <span className="text-[10px] text-white/35">{fmt(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-5 mt-1">
                    <motion.button whileTap={{ scale: 0.88 }} onClick={() => audioStore.prev()}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors" aria-label="Previous">
                      <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button whileTap={{ scale: 0.9 }} onClick={toggleInPagePlay} disabled={!audioReady}
                      className="w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', boxShadow: '0 5px 24px rgba(108,99,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)' }}
                      aria-label={audioPlaying ? 'Pause' : 'Play'}>
                      {audioPlaying
                        ? <Pause className="w-6 h-6 text-white fill-white" />
                        : <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      }
                    </motion.button>

                    <motion.button whileTap={{ scale: 0.88 }} onClick={() => audioStore.next()}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors" aria-label="Next">
                      <SkipForward className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Info ── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 sm:mt-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">{video.title}</h1>

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

              {/* Audio / Video toggle */}
              <motion.button whileTap={{ scale: 0.95 }} onClick={toggleAudioMode}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all"
                style={audioMode ? {
                  background: 'linear-gradient(135deg,rgba(108,99,255,0.25),rgba(167,139,250,0.15))',
                  border: '1px solid rgba(108,99,255,0.45)',
                  color: '#a78bfa',
                } : {
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.55)',
                }}>
                {audioMode
                  ? <><VideoIcon className="w-3.5 h-3.5 shrink-0" /> Switch to Video</>
                  : <><Headphones className="w-3.5 h-3.5 shrink-0" /> Listen as Audio</>
                }
              </motion.button>

              {/* Download — save to app */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all"
                style={downloaded ? {
                  background: 'linear-gradient(135deg,rgba(52,211,153,0.2),rgba(16,185,129,0.1))',
                  border: '1px solid rgba(52,211,153,0.35)',
                  color: '#34d399',
                } : {
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.55)',
                }}
                aria-label={downloaded ? 'Remove from downloads' : 'Save to downloads'}
              >
                {downloaded
                  ? <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Downloaded</>
                  : <><Download className="w-3.5 h-3.5 shrink-0" /> Download</>
                }
              </motion.button>

              <a href={ytUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 glass rounded-full text-white/50 hover:text-red-400 text-xs sm:text-sm font-medium transition-all sm:ml-auto">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" /> YouTube
              </a>
            </div>

            {video.description && (
              <div className="mt-4 sm:mt-5 rounded-2xl p-4 sm:p-5"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  <LinkifiedText text={video.description} />
                </p>
              </div>
            )}

            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                {video.tags.map(tag => (
                  <span key={tag} className="px-3 py-0.5 glass rounded-full text-xs text-white/35">#{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Related ── */}
        <div className="lg:w-72 xl:w-80 shrink-0 min-w-0">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Related</h3>
          {relatedVideos.length === 0
            ? <p className="text-white/25 text-sm">No related videos found.</p>
            : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                {relatedVideos.map(v => <VideoCard key={v.id} video={v} />)}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
