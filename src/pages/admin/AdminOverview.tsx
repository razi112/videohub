import { motion } from 'framer-motion'
import { Video, Eye, FileText, Users, TrendingUp, Star, ArrowUpRight } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  glow: string
  delay?: number
}

function StatCard({ icon: Icon, label, value, color, glow, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, scale: 1.02 }}
      style={{ willChange: 'transform' }}
      className="group relative bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-4 sm:p-5 overflow-hidden cursor-default"
    >
      {/* Glow on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 rounded-2xl pointer-events-none ${glow}`}
      />
      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.12, rotate: -6 }}
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
        className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${color} shadow-lg`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </motion.div>
      <p className="relative text-2xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1 tabular-nums">
        {value.toLocaleString()}
      </p>
      <p className="relative text-xs sm:text-sm text-gray-500 group-hover:text-gray-400 transition-colors leading-tight">
        {label}
      </p>
    </motion.div>
  )
}

const statConfig = [
  { icon: Video,      label: 'Total Videos', key: 'total',         color: 'bg-[#6c63ff]',  glow: 'bg-[#6c63ff]/5' },
  { icon: Eye,        label: 'Published',    key: 'published',     color: 'bg-emerald-600', glow: 'bg-emerald-600/5' },
  { icon: FileText,   label: 'Drafts',       key: 'drafts',        color: 'bg-amber-600',   glow: 'bg-amber-600/5' },
  { icon: Star,       label: 'Featured',     key: 'featured',      color: 'bg-orange-600',  glow: 'bg-orange-600/5' },
  { icon: TrendingUp, label: 'Total Views',  key: 'totalViews',    color: 'bg-blue-600',    glow: 'bg-blue-600/5' },
  { icon: Users,      label: 'Saved',        key: 'totalFavorites', color: 'bg-pink-600',   glow: 'bg-pink-600/5' },
] as const

// Animated list row for videos
function VideoListRow({ v, index }: { v: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
      whileHover={{ x: 4, backgroundColor: '#16161e' }}
      style={{ willChange: 'transform' }}
      className="flex items-center gap-2 sm:gap-3 min-w-0 rounded-xl px-2 py-1.5 -mx-2 transition-colors cursor-default"
    >
      <span className="text-gray-600 text-xs font-mono w-4 shrink-0">{index + 1}.</span>
      <motion.img
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.2 }}
        src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`}
        alt={v.title}
        className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded-md shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-white truncate group-hover:text-[#a78bfa] transition-colors">{v.title}</p>
        <p className="text-xs text-gray-600 hidden sm:block">{v.category?.name}</p>
      </div>
      <span className="text-xs text-gray-500 font-mono shrink-0 tabular-nums">{v.views.toLocaleString()}</span>
    </motion.div>
  )
}

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
    { label: '+ Add Video',  href: '/admin/videos/add', primary: true },
    { label: 'Categories',   href: '/admin/categories' },
    { label: 'Featured',     href: '/admin/featured' },
    { label: 'Analytics',    href: '/admin/analytics' },
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening on VideoHub.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {statConfig.map((s, i) => (
          <StatCard
            key={s.key}
            icon={s.icon}
            label={s.label}
            value={stats[s.key]}
            color={s.color}
            glow={s.glow}
            delay={i * 0.05}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Most Watched */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="font-bold text-white text-sm sm:text-base">Most Watched</h2>
            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <Link to="/admin/analytics" className="flex items-center gap-1 text-xs text-[#6c63ff] hover:text-[#a78bfa] transition-colors">
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
          className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="font-bold text-white text-sm sm:text-base">Recently Added</h2>
            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <Link to="/admin/videos" className="flex items-center gap-1 text-xs text-[#6c63ff] hover:text-[#a78bfa] transition-colors">
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
                whileHover={{ x: 4, backgroundColor: '#16161e' }}
                className="flex items-center gap-2 sm:gap-3 min-w-0 rounded-xl px-2 py-1.5 -mx-2 transition-colors cursor-default"
              >
                <motion.img
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.2 }}
                  src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white truncate">{v.title}</p>
                  <p className="text-xs text-gray-600">{new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 hidden sm:inline ${
                    v.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {v.status}
                </motion.span>
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
        className="mt-4 sm:mt-6 bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-4 sm:p-6"
      >
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
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  a.primary
                    ? 'bg-gradient-to-r from-[#6c63ff] to-[#5b53ee] text-white shadow-md shadow-[#6c63ff]/20 hover:shadow-[#6c63ff]/40'
                    : 'bg-[#16161e] border border-[#2a2a3a] text-gray-400 hover:text-white hover:border-[#6c63ff]/30'
                }`}
              >
                {a.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
