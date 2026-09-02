import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import { useMemo } from 'react'
import {
  Music2, BookOpen, Clapperboard, Trophy, Globe2, FlaskConical,
  Lightbulb, Mic2, BookMarked, Zap, Drama, UtensilsCrossed,
  Gamepad2, Mosque, BookText, Radio, Camera, Cpu, Pencil,
  GraduationCap, Heart, Star, Layers, type LucideIcon,
} from 'lucide-react'

// ── Slug / name → icon + gradient mapping ────────────────────
interface CatStyle { icon: LucideIcon; from: string; to: string }

const CATEGORY_STYLES: Record<string, CatStyle> = {
  // by slug
  gaming:        { icon: Gamepad2,       from: '#6c63ff', to: '#a78bfa' },
  islamic:       { icon: Mosque,         from: '#059669', to: '#34d399' },
  'islamic-stories': { icon: BookText,   from: '#0ea5e9', to: '#38bdf8' },
  live:          { icon: Radio,          from: '#ef4444', to: '#f87171' },
  qawwali:       { icon: Mic2,           from: '#d946ef', to: '#e879f9' },
  stories:       { icon: BookMarked,     from: '#f59e0b', to: '#fbbf24' },
  technology:    { icon: Cpu,            from: '#0ea5e9', to: '#38bdf8' },
  tutorials:     { icon: Pencil,         from: '#f97316', to: '#fb923c' },
  vlog:          { icon: Camera,         from: '#8b5cf6', to: '#a78bfa' },
  education:     { icon: GraduationCap,  from: '#10b981', to: '#34d399' },
  science:       { icon: FlaskConical,   from: '#06b6d4', to: '#22d3ee' },
  music:         { icon: Music2,         from: '#ec4899', to: '#f472b6' },
  movies:        { icon: Clapperboard,   from: '#6366f1', to: '#818cf8' },
  sports:        { icon: Trophy,         from: '#f59e0b', to: '#fbbf24' },
  travel:        { icon: Globe2,         from: '#14b8a6', to: '#2dd4bf' },
  cooking:       { icon: UtensilsCrossed,from: '#ef4444', to: '#f87171' },
  drama:         { icon: Drama,          from: '#8b5cf6', to: '#c084fc' },
  news:          { icon: Zap,            from: '#f97316', to: '#fb923c' },
  books:         { icon: BookOpen,       from: '#84cc16', to: '#a3e635' },
  health:        { icon: Heart,          from: '#f43f5e', to: '#fb7185' },
  mathematics:   { icon: Star,           from: '#eab308', to: '#facc15' },
  english:       { icon: BookOpen,       from: '#06b6d4', to: '#67e8f9' },
  announcements: { icon: Radio,          from: '#6c63ff', to: '#a78bfa' },
}

// Fallback palette for unknown slugs
const FALLBACK_ICONS: CatStyle[] = [
  { icon: Layers,       from: '#6c63ff', to: '#a78bfa' },
  { icon: Star,         from: '#f59e0b', to: '#fbbf24' },
  { icon: Globe2,       from: '#10b981', to: '#34d399' },
  { icon: Lightbulb,    from: '#0ea5e9', to: '#38bdf8' },
  { icon: GraduationCap,from: '#d946ef', to: '#e879f9' },
  { icon: Zap,          from: '#ef4444', to: '#f87171' },
]

function getCatStyle(slug: string, name: string, index: number): CatStyle {
  const key = slug.toLowerCase()
  const nameKey = name.toLowerCase().replace(/\s+/g, '-')
  return (
    CATEGORY_STYLES[key] ||
    CATEGORY_STYLES[nameKey] ||
    FALLBACK_ICONS[index % FALLBACK_ICONS.length]
  )
}

export default function CategoriesPage() {
  const { videos, categories, setSelectedCategory, selectedCategory } = useStore()

  const publishedVideos = useMemo(() => videos.filter((v) => v.status === 'published'), [videos])

  const categoriesWithCount = useMemo(() =>
    categories
      .map((cat) => ({ ...cat, count: publishedVideos.filter((v) => v.category_id === cat.id).length }))
      .filter((c) => c.count > 0),
    [categories, publishedVideos]
  )

  const activeCat = categories.find((c) => c.id === selectedCategory)
  const videosInCategory = useMemo(() =>
    selectedCategory ? publishedVideos.filter((v) => v.category_id === selectedCategory) : [],
    [publishedVideos, selectedCategory]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 sm:mb-9">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">Categories</h1>
        <p className="text-white/30 text-sm">Browse videos by topic</p>
      </motion.div>

      {/* Category tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
        {categoriesWithCount.map((cat, i) => {
          const style = getCatStyle(cat.slug, cat.name, i)
          const Icon = style.icon
          const isActive = selectedCategory === cat.id
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
              className={`relative p-4 sm:p-5 rounded-2xl text-left transition-all overflow-hidden ${
                isActive
                  ? 'bg-white/12 border border-white/20 shadow-lg shadow-black/20'
                  : 'glass hover:bg-white/[0.07]'
              }`}
            >
              {/* Shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-2xl" />

              {/* Icon badge */}
              <div
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
                  boxShadow: `0 4px 14px ${style.from}55`,
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
              </div>

              <p className={`font-semibold text-xs sm:text-sm mb-0.5 leading-tight ${isActive ? 'text-white' : 'text-white/70'}`}>
                {cat.name}
              </p>
              <p className="text-[10px] sm:text-xs text-white/30">{cat.count} video{cat.count !== 1 ? 's' : ''}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Videos in selected category */}
      {activeCat && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-semibold text-white/80">{activeCat.name}</h2>
            <button onClick={() => setSelectedCategory('')}
              className="text-xs text-white/30 hover:text-white/60 transition-colors glass px-3 py-1 rounded-full">
              Clear ×
            </button>
          </div>
          {videosInCategory.length === 0 ? (
            <p className="text-white/30 text-sm">No published videos in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {videosInCategory.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <VideoCard video={v} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
