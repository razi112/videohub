import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { History, Clock, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import toast from 'react-hot-toast'
import { GoogleSignInPrompt } from './AccountPage'

/* ── Date grouping helper ─────────────────────────────────── */
function groupByDate<T extends { updated_at: string }>(items: T[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

  const groups: { label: string; items: T[] }[] = []
  const map = new Map<string, T[]>()

  for (const item of items) {
    const d = new Date(item.updated_at); d.setHours(0, 0, 0, 0)
    let label: string
    if (d.getTime() === today.getTime()) label = 'Today'
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday'
    else label = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    if (!map.has(label)) { map.set(label, []); groups.push({ label, items: map.get(label)! }) }
    map.get(label)!.push(item)
  }
  return groups
}

export default function HistoryPage() {
  const { watchHistory, videos, currentUser } = useStore()

  const historyVideos = useMemo(() =>
    watchHistory
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map((h) => ({ ...h, video: videos.find((v) => v.id === h.video_id) }))
      .filter((h): h is typeof h & { video: NonNullable<typeof h['video']> } => !!h.video),
    [watchHistory, videos]
  )

  const groups = useMemo(() => groupByDate(historyVideos), [historyVideos])

  const removeEntry = (videoId: string) => {
    useStore.setState(s => ({ watchHistory: s.watchHistory.filter(h => h.video_id !== videoId) }))
  }

  const clearAll = () => {
    useStore.setState({ watchHistory: [] })
    toast.success('Watch history cleared')
  }

  /* ── Not signed in ── */
  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 glass rounded-xl flex items-center justify-center">
              <History className="w-4 h-4 text-[#a78bfa]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Watch History</h1>
          </div>
        </motion.div>
        <div
          className="max-w-sm mx-auto rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <GoogleSignInPrompt
            heading="Sign in to see your history"
            subtext="Sign in with Google to track what you've watched and pick up where you left off."
            compact={false}
          />
        </div>
      </div>
    )
  }

  /* ── Empty state ── */
  if (historyVideos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 glass rounded-xl flex items-center justify-center">
              <History className="w-4 h-4 text-[#a78bfa]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Watch History</h1>
          </div>
        </motion.div>
        <div className="text-center py-24">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-base sm:text-lg font-semibold text-white/40">No watch history yet</p>
          <p className="text-sm mt-1 mb-7 text-white/25">Videos you watch will appear here.</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              to="/videos"
              className="glass-strong px-6 py-3 rounded-full text-white/70 hover:text-white font-medium text-sm transition-all"
            >
              Browse Videos
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  /* ── Main view ── */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 glass rounded-xl flex items-center justify-center">
                <History className="w-4 h-4 text-[#a78bfa]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Watch History</h1>
            </div>
            <p className="text-white/30 text-sm ml-12">
              {historyVideos.length} video{historyVideos.length !== 1 ? 's' : ''} watched
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={clearAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white/40 hover:text-red-400 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </motion.button>
        </div>
      </motion.div>

      {/* Date-grouped grids */}
      <div className="flex flex-col gap-10">
        {groups.map(({ label, items }, gi) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.05 }}
          >
            {/* Group label */}
            <h2 className="text-sm font-semibold text-white/35 mb-4 px-0.5 tracking-wide">{label}</h2>

            {/* VideoCard grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {items.map((h, i) => (
                <motion.div
                  key={h.id}
                  className="relative group"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.05 + i * 0.04 }}
                >
                  <VideoCard video={h.video} />

                  {/* Remove button — top-right corner, visible on hover */}
                  <button
                    onClick={() => removeEntry(h.video_id)}
                    title="Remove from history"
                    className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
                  >
                    <X className="w-3 h-3 text-white/80" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
