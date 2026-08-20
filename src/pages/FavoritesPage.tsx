import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import { useMemo } from 'react'

export default function FavoritesPage() {
  const { favorites, videos } = useStore()

  const favoriteVideos = useMemo(() =>
    favorites
      .map((f) => videos.find((v) => v.id === f.video_id))
      .filter(Boolean) as typeof videos,
    [favorites, videos]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1 sm:mb-2">
          <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-red-400 fill-red-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Saved Videos</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6 sm:mb-8">
          {favoriteVideos.length} saved video{favoriteVideos.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {favoriteVideos.length === 0 ? (
        <div className="text-center py-16 sm:py-20 text-gray-500">
          <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-700" />
          <p className="text-base sm:text-lg font-semibold text-gray-400">No saved videos yet</p>
          <p className="text-sm mt-1 mb-6">Click the Save button on any video to add it here.</p>
          <Link
            to="/videos"
            className="inline-block bg-[#6c63ff] hover:bg-[#5b53ee] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors"
          >
            Browse Videos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {favoriteVideos.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <VideoCard video={v} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
