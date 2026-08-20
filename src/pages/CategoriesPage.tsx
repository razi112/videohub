import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import { useMemo } from 'react'
import { BookOpen } from 'lucide-react'

export default function CategoriesPage() {
  const { videos, categories, setSelectedCategory, selectedCategory } = useStore()

  const publishedVideos = useMemo(() => videos.filter((v) => v.status === 'published'), [videos])

  const categoriesWithCount = useMemo(() =>
    categories
      .map((cat) => ({
        ...cat,
        count: publishedVideos.filter((v) => v.category_id === cat.id).length,
      }))
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Categories</h1>
        <p className="text-gray-500 text-sm mb-6 sm:mb-8">Browse videos by topic</p>
      </motion.div>

      {/* Category grid — 2 cols mobile, 3 tablet, 4 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
        {categoriesWithCount.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#6c63ff]/20 border-[#6c63ff]/50 shadow-lg shadow-[#6c63ff]/10'
                : 'bg-[#16161e] border-[#2a2a3a] hover:border-[#6c63ff]/30'
            }`}
          >
            <BookOpen className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 sm:mb-3 ${selectedCategory === cat.id ? 'text-[#a78bfa]' : 'text-gray-500'}`} />
            <p className={`font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 leading-tight ${selectedCategory === cat.id ? 'text-white' : 'text-gray-300'}`}>
              {cat.name}
            </p>
            <p className="text-xs text-gray-500">{cat.count} video{cat.count !== 1 ? 's' : ''}</p>
          </motion.button>
        ))}
      </div>

      {/* Videos in selected category */}
      {activeCat && (
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">{activeCat.name}</h2>
            <button
              onClick={() => setSelectedCategory('')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear ×
            </button>
          </div>
          {videosInCategory.length === 0 ? (
            <p className="text-gray-500 text-sm">No published videos in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {videosInCategory.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <VideoCard video={v} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
