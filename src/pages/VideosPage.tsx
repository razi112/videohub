import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import CategoryFilter from '../components/ui/CategoryFilter'
import SearchBar from '../components/ui/SearchBar'
import { useMemo } from 'react'

export default function VideosPage() {
  const { videos, selectedCategory, searchQuery } = useStore()

  const filtered = useMemo(() => {
    let result = videos.filter((v) => v.status === 'published')
    if (selectedCategory) result = result.filter((v) => v.category_id === selectedCategory)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q)) ||
          v.category?.name.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [videos, selectedCategory, searchQuery])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">All Videos</h1>
        <p className="text-gray-500 text-sm mb-6 sm:mb-8">
          {filtered.length} video{filtered.length !== 1 ? 's' : ''} available
        </p>
      </motion.div>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <SearchBar />
        <CategoryFilter />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 sm:py-20 text-gray-500">
          <p className="text-4xl mb-3">🎬</p>
          <p className="text-lg font-semibold text-gray-400">No videos found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {filtered.map((v, i) => (
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
  )
}
