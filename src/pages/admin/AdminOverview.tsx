import { motion } from 'framer-motion'
import { Video, Eye, FileText, Users, TrendingUp, Star, ArrowUpRight, ArrowRight } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

/* ── Stat card ─────────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  accent: string   // tailwind bg class for icon pill
  glow: string     // raw rgba for ambient blob
  delay?: number
}

function StatCard({ icon: Icon, label, value, accent, glow, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, scale: 1.02 }}
      style={{ willChange: 'transform' }}
      className="relative glass rounded-2xl p-4 sm:p-5 overflow-hidden cursor-default group"
    >
      {/* Top edge gleam */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {/* Ambient glow blob */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, filter: 'blur(12px)' }}
      />
      {/* Icon pill */}
      <motion.div
        whileHover={{ scale: 1.12, rotate: -6 }}
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
        className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${accent} shadow-lg`}
        style={{ border: '1px solid rgba(255,255,255,0.18)', boxShadow: `0 4px 16px ${glow}` }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
      </motion.div>
      <p className="relative text-2xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1 tabular-nums">
        {value.toLocaleString()}
      </p>
      <p className="relative text-xs sm:text-sm text-white/40 group-hover:text-white/60 transition-colors leading-tight">
        {label}
      </p>
    </motion.div>
  )
}

const statConfig = [
  { icon: Video,      label: 'Total Videos', key: 'total',          accent: 'bg-[#6c63ff]',        glow: 'rgba(108,99,255,0.6)' },
  { icon: Eye,        label: 'Published',    key: 'published',      accent: 'bg-emerald-500',      glow: 'rgba(16,185,129,0.6)' },
  { icon: FileText,   label: 'Drafts',       key: 'drafts',         accent: 'bg-amber-500',        glow: 'rgba(245,158,11,0.6)' },
  { icon: Star,       label: 'Featured',     key: 'featured',       accent: 'bg-orange-500',       glow: 'rgba(249,115,22,0.6)' },
  { icon: TrendingUp, label: 'Total Views',  key: 'totalViews',     accent: 'bg-blue-500',         glow: 'rgba(59,130,246,0.6)' },
  { icon: Users,      label: 'Saved',        key: 'totalFavorites', accent: 'bg-pink-500',         glow: 'rgba(236,72,153,0.6)' },
] as const

/* ── Video list row ─────────────────────────────────────────── */
function VideoListRow({ v, index }: { v: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
      whileHover={{ x: 4 }}
      style={{ willChange: 'transform' }}
      className="flex items-center gap-2 sm:gap-3 min-w-0 rounded-xl px-2 py-2 -mx-2 hover:bg-white/[0.04] transition-colors cursor-default"
    >
      <span className="text-white/20 text-xs font-mono w-4 shrink-0">{index + 1}.</span>
      <motion.img
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.2 }}
        src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`}
        alt={v.title}
        className="w-11 h-7 sm:w-12 sm:h-8 object-cover rounded-lg shrink-0 border border-white/[0.08]"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-white/80 truncate">{v.title}</p>
        <p className="text-xs text-white/30 hidden sm:block">{v.category?.name}</p>
      </div>
      <span className="text-xs text-white/30 font-mono shrink-0 tabular-nums">{v.views.toLocaleString()}</span>
    </motion.div>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function AdminOverview() {
  const { videos, favorites } = useStore()

  const stats = useMemo(() => ({
    total:          videos.length,
    published:      videos.filter(v => v.status === 'published').length,
    drafts:         videos.filter(v => v.status === 'draft').length,
    featured:       videos.filter(v => v.is_featured).length,
    totalViews:     videos.reduce((acc, v) => acc + v.views, 0),
    totalFavorites: favorites.length,
  }), [videos, favorites])

  const popularVideos = useMemo(() => [...videos].sort((a, b) => b.views - a.views).slice(0, 5), [videos])
  const recentVideos  = useMemo(() =>
    [...videos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [videos])

  const quickActions = [
    { label: '+ Add Video', href: '/admin/videos/add', primary: true },
    { label: 'Categories',  href: '/admin/categories' },
    { label: 'Featured',    href: '/admin/featured' },
    { label: 'Analytics',   href: '/admin/analytics' },
  ]

  return (
    <div>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-white/40 text-sm mt-1">Welcome back! Here's what's happening on VideoHub.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {statConfig.map((s, i) => (
          <StatCard
            key={s.key}
            icon={s.icon}
            label={s.label}
            value={stats[s.key]}
            accent={s.accent}
            glow={s.glow}
            delay={i * 0.06}
          />
        ))}
      </div>

      {/* Panels row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Most Watched */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="relative glass rounded-2xl p-4 sm:p-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="font-bold text-white text-sm sm:text-base">Most Watched</h2>
            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <Link to="/admin/analytics" className="flex items-center gap-1 text-xs text-[#a78bfa] hover:text-white transition-colors">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </motion.div>
          </div>
          <div className="space-y-0.5">
            {popularVideos.map((v, i) => (
              <VideoListRow key={v.id} v={v} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Recently Added */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.4 }}
          className="relative glass rounded-2xl p-4 sm:p-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="font-bold text-white text-sm sm:text-base">Recently Added</h2>
            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <Link to="/admin/videos" className="flex items-center gap-1 text-xs text-[#a78bfa] hover:text-white transition-colors">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </motion.div>
          </div>
          <div className="space-y-0.5">
            {recentVideos.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.34 + i * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 sm:gap-3 min-w-0 rounded-xl px-2 py-2 -mx-2 hover:bg-white/[0.04] transition-colors cursor-default"
              >
                <motion.img
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.2 }}
                  src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-11 h-7 sm:w-12 sm:h-8 object-cover rounded-lg shrink-0 border border-white/[0.08]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white/80 truncate">{v.title}</p>
                  <p className="text-xs text-white/30">{new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 hidden sm:inline glass ${
                  v.status === 'published'
                    ? 'text-emerald-400 border-emerald-500/25'
                    : 'text-amber-400 border-amber-500/25'
                }`}>
                  {v.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="relative mt-4 sm:mt-5 glass rounded-2xl p-4 sm:p-6 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        <h2 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Quick Actions</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.href}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.42 + i * 0.04 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                to={a.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  a.primary
                    ? 'bg-white text-[#080810] hover:bg-white/90 shadow-lg shadow-white/10'
                    : 'glass text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {a.label}
                {!a.primary && <ArrowRight className="w-3.5 h-3.5" />}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
