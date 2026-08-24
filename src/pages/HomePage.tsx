import { motion } from 'framer-motion'
import { Play, ArrowRight, Sparkles, RefreshCw, WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import CategoryFilter from '../components/ui/CategoryFilter'
import { getEmbedUrl } from '../lib/youtube'
import { useMemo } from 'react'

export default function HomePage() {
  const { videos, selectedCategory, searchQuery, videosLoading, videosError, loadVideos } = useStore()

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
          <div className="absolute inset-0 bg-gradient-to-b from-[#6c63ff]/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(108,99,255,0.18),transparent)] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-22 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

              {/* Text */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs text-[#a78bfa] mb-5">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  Featured Video
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.12] mb-4 tracking-tight">
                  Listen Something<br />
                  <span className="bg-gradient-to-r from-[#a78bfa] via-[#6c63ff] to-[#a78bfa] bg-clip-text text-transparent">
                    New Today
                  </span>
                </h1>

                <p className="text-white/50 text-base sm:text-lg mb-2 line-clamp-2">{featuredVideo.title}</p>
                <p className="text-white/30 text-sm mb-8 line-clamp-2 hidden sm:block">{featuredVideo.description}</p>

                <div className="flex flex-wrap gap-3">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to={`/videos/${featuredVideo.id}?autoplay=1`}
                      className="flex items-center gap-2 bg-white text-[#080810] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all hover:bg-white/90 shadow-xl shadow-white/10"
                    >
                      <Play className="w-4 h-4 fill-current shrink-0" />
                      Watch Now
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/videos"
                      className="flex items-center gap-2 glass rounded-full px-5 py-2.5 sm:px-6 sm:py-3 text-white/70 font-semibold text-sm sm:text-base hover:text-white hover:bg-white/10 transition-all"
                    >
                      Explore Videos
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Video embed */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden glass-strong shadow-2xl shadow-black/40 aspect-video">
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none z-10 rounded-2xl" />
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

      {/* ── Category filter ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <CategoryFilter />
      </section>

      {/* ── Video grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
        {showFiltered ? (
          <>
            <h2 className="text-base sm:text-lg font-semibold text-white/80 mb-5">
              {searchQuery ? `Results for "${searchQuery}"` : 'Filtered Videos'}
              <span className="ml-2 text-sm font-normal text-white/30">({filteredVideos.length})</span>
            </h2>
            {filteredVideos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-white/50">No videos found</p>
                <p className="text-sm mt-1 text-white/30">Try different search terms or clear filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredVideos.map((v, i) => (
                  <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <VideoCard video={v} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-white/80">Latest Videos</h2>
              <Link to="/videos" className="flex items-center gap-1 text-sm text-[#a78bfa] hover:text-white transition-colors shrink-0">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Loading state */}
            {videosLoading && (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="aspect-video bg-white/5" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-white/8 rounded-full w-3/4" />
                      <div className="h-3 bg-white/5 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!videosLoading && videosError && (
              <div className="text-center py-16">
                <WifiOff className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="font-semibold text-white/50 mb-1">Couldn't load videos</p>
                <p className="text-xs text-white/30 mb-5">{videosError}</p>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => loadVideos()}
                  className="flex items-center gap-2 mx-auto px-4 py-2 glass rounded-full text-sm text-white/60 hover:text-white transition-all">
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </motion.button>
              </div>
            )}

            {/* Empty state */}
            {!videosLoading && !videosError && latestVideos.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🎬</p>
                <p className="font-semibold text-white/50">No videos yet</p>
                <p className="text-sm mt-1 text-white/30">Check back soon</p>
              </div>
            )}

            {/* Video grid */}
            {!videosLoading && !videosError && latestVideos.length > 0 && (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {latestVideos.map((v, i) => (
                  <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <VideoCard video={v} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
