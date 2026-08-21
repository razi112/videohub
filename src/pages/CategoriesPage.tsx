import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import { useMemo } from 'react'

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
        {categoriesWithCount.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
            className={`relative p-4 sm:p-5 rounded-2xl text-left transition-all overflow-hidden ${
              selectedCategory === cat.id
                ? 'bg-white/12 border border-white/20 shadow-lg shadow-black/20'
                : 'glass hover:bg-white/[0.07]'
            }`}
          >
            {/* Shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-2xl" />
            <div className={`text-2xl sm:text-3xl mb-2 sm:mb-3`}>
              {['🎵','📚','🎬','🏆','🌍','🔬','💡','🎤','📖','⚽','🎭','🍳'][i % 12]}
            </div>
            <p className={`font-semibold text-xs sm:text-sm mb-0.5 leading-tight ${selectedCategory === cat.id ? 'text-white' : 'text-white/70'}`}>
              {cat.name}
            </p>
            <p className="text-[10px] sm:text-xs text-white/30">{cat.count} video{cat.count !== 1 ? 's' : ''}</p>
          </motion.button>
        ))}
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
