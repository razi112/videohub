import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { useMemo } from 'react'
import { TrendingUp, Eye, Video, Tag } from 'lucide-react'

function Bar({ value, max, color = '#6c63ff', delay = 0 }: { value: number; max: number; color?: string; delay?: number }) {
  const pct = max === 0 ? 0 : (value / max) * 100
  return (
    <div className="h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: `${pct}%`, opacity: 1 }}
        transition={{ duration: 0.9, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}55` }}
      />
    </div>
  )
}

const PALETTE = ['#6c63ff','#a78bfa','#22c55e','#f59e0b','#ec4899','#3b82f6','#ef4444','#06b6d4']

export default function AdminAnalyticsPage() {
  const { videos, categories, favorites } = useStore()

  const stats = useMemo(() => {
    const published = videos.filter(v => v.status === 'published')
    const totalViews = videos.reduce((acc, v) => acc + v.views, 0)
    const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 10)
    const maxViews = topVideos[0]?.views || 1
    const catStats = categories.map(cat => ({
      name: cat.name,
      count: videos.filter(v => v.category_id === cat.id).length,
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count)
    const maxCat = catStats[0]?.count || 1
    return { published, totalViews, topVideos, maxViews, catStats, maxCat }
  }, [videos, categories, favorites])

  const statCards = [
    { label: 'Total Videos', value: videos.length,              icon: Video,      color: '#6c63ff' },
    { label: 'Published',    value: stats.published.length,     icon: TrendingUp, color: '#22c55e' },
    { label: 'Total Views',  value: stats.totalViews,           icon: Eye,        color: '#3b82f6' },
    { label: 'Categories',   value: categories.length,          icon: Tag,        color: '#f59e0b' },
    { label: 'Drafts',       value: videos.length - stats.published.length, icon: Video, color: '#eab308' },
    { label: 'Favorites',    value: favorites.length,           icon: TrendingUp, color: '#ec4899' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-gray-500 text-sm mb-6 sm:mb-8">Overview of VideoHub content performance</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            whileHover={{ y: -3, scale: 1.03 }}
            style={{ willChange: 'transform' }}
            className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-4 sm:p-5 text-center cursor-default group"
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: `${s.color}22` }}
            >
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </motion.div>
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">{s.value.toLocaleString()}</p>
            <p className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Top Videos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6"
        >
          <h2 className="font-bold text-white mb-5 sm:mb-6 text-sm sm:text-base">Top Viewed Videos</h2>
          <div className="space-y-4">
            {stats.topVideos.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                whileHover={{ x: 3 }}
                className="cursor-default"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-700 font-mono w-4 shrink-0">{i + 1}.</span>
                    <p className="text-xs sm:text-sm text-gray-300 truncate">{v.title}</p>
                  </div>
                  <span className="text-xs text-gray-600 font-mono shrink-0 ml-2 tabular-nums">{v.views.toLocaleString()}</span>
                </div>
                <Bar value={v.views} max={stats.maxViews} delay={0.35 + i * 0.05} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6"
        >
          <h2 className="font-bold text-white mb-5 sm:mb-6 text-sm sm:text-base">Category Distribution</h2>
          <div className="space-y-4">
            {stats.catStats.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                whileHover={{ x: 3 }}
                className="cursor-default"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % 8] }} />
                    <p className="text-xs sm:text-sm text-gray-300">{cat.name}</p>
                  </div>
                  <span className="text-xs text-gray-600 font-mono tabular-nums">{cat.count} videos</span>
                </div>
                <Bar value={cat.count} max={stats.maxCat} color={PALETTE[i % 8]} delay={0.4 + i * 0.06} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
