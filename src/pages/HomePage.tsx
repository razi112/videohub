import { motion } from 'framer-motion'
import { Play, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import CategoryFilter from '../components/ui/CategoryFilter'
import SearchBar from '../components/ui/SearchBar'
import { getEmbedUrl } from '../lib/youtube'
import { useMemo } from 'react'

export default function HomePage() {
  const { videos, selectedCategory, searchQuery } = useStore()

  const publishedVideos = useMemo(() => videos.filter((v) => v.status === 'published'), [videos])
  const featuredVideo = useMemo(() => publishedVideos.find((v) => v.is_featured), [publishedVideos])
  const latestVideos = useMemo(() =>
    [...publishedVideos]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8),
    [publishedVideos]
  )

  const filteredVideos = useMemo(() => {
    let result = publishedVideos
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
    return result
  }, [publishedVideos, selectedCategory, searchQuery])

  const showFiltered = selectedCategory || searchQuery

  return (
    <div>
      {/* ── Hero ── */}
      {featuredVideo && !showFiltered && (
        <section className="relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff]/20 via-[#0a0a0f] to-[#0a0a0f]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#6c63ff22,_transparent_60%)]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55 }}
              >
                <div className="inline-flex items-center gap-2 bg-[#6c63ff]/20 border border-[#6c63ff]/30 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm text-[#a78bfa] mb-4 sm:mb-6">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  Featured Video
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-3 sm:mb-4">
                  Learn Something<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6c63ff] to-[#a78bfa]">
                    New Today
                  </span>
                </h1>

                <p className="text-gray-400 text-base sm:text-lg mb-2 sm:mb-4 line-clamp-2">
                  {featuredVideo.title}
                </p>
                <p className="text-gray-500 text-sm mb-6 sm:mb-8 line-clamp-2 hidden sm:block">
                  {featuredVideo.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/videos/${featuredVideo.id}`}
                    className="flex items-center gap-2 bg-[#6c63ff] hover:bg-[#5b53ee] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all hover:shadow-lg hover:shadow-[#6c63ff]/30"
                  >
                    <Play className="w-4 h-4 fill-white shrink-0" />
                    Watch Now
                  </Link>
                  <Link
                    to="/videos"
                    className="flex items-center gap-2 bg-[#16161e] border border-[#2a2a3a] hover:border-[#6c63ff]/40 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all"
                  >
                    Explore Videos
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                </div>
              </motion.div>

              {/* Video embed */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
              >
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-[#2a2a3a] shadow-2xl shadow-[#6c63ff]/10 aspect-video">
                  <iframe
                    src={getEmbedUrl(featuredVideo.youtube_video_id, { rel: false })}
                    title={featuredVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── Search + Filter ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          <SearchBar />
          <CategoryFilter />
        </div>
      </section>

      {/* ── Filtered results ── */}
      {showFiltered ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : 'Filtered Videos'}
            <span className="ml-2 text-sm font-normal text-gray-500">({filteredVideos.length})</span>
          </h2>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-16 sm:py-20 text-gray-500">
              <p className="text-3xl mb-2">🔍</p>
              <p className="font-semibold text-gray-400">No videos found</p>
              <p className="text-sm mt-1">Try different search terms or clear filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filteredVideos.map((v, i) => (
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
        </section>
      ) : (
        /* ── Latest Videos ── */
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">Latest Videos</h2>
            <Link
              to="/videos"
              className="flex items-center gap-1 text-sm text-[#6c63ff] hover:text-[#a78bfa] transition-colors shrink-0"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {latestVideos.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <VideoCard video={v} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
