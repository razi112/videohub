import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import CategoryFilter from '../components/ui/CategoryFilter'
import SearchBar from '../components/ui/SearchBar'
import { useMemo } from 'react'

export default function VideosPage() {
  const { videos, selectedCategory, searchQuery } = useStore()
  const isSearching = searchQuery.trim().length > 0

  const filtered = useMemo(() => {
    let result = videos.filter((v) => v.status === 'published')
    if (selectedCategory) result = result.filter((v) => v.category_id === selectedCategory)
    if (isSearching) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q)) ||
          v.category?.name.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [videos, selectedCategory, searchQuery, isSearching])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
          {isSearching ? 'Search Results' : 'All Videos'}
        </h1>
        <p className="text-white/30 text-sm">
          {isSearching
            ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchQuery.trim()}"`
            : `${filtered.length} video${filtered.length !== 1 ? 's' : ''} available`}
        </p>
      </motion.div>

      <div className="space-y-3 mb-6 sm:mb-8">
        <SearchBar />
        <CategoryFilter />
      </div>

      {/* Loading / empty states */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🎬</p>
          <p className="text-lg font-semibold text-white/50">No videos found</p>
          <p className="text-sm mt-1 text-white/30">Try adjusting your search or filters</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery + selectedCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          >
            {filtered.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
