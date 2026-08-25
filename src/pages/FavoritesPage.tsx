import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import VideoCard from '../components/ui/VideoCard'
import { useMemo } from 'react'
import { GoogleSignInPrompt } from './AccountPage'

export default function FavoritesPage() {
  const { favorites, videos, currentUser } = useStore()

  const favoriteVideos = useMemo(() =>
    favorites.map((f) => videos.find((v) => v.id === f.video_id)).filter(Boolean) as typeof videos,
    [favorites, videos]
  )

  /* ── Not logged in: show Google Sign-In prompt ── */
  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 glass rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Saved Videos</h1>
          </div>
        </motion.div>

        <div
          className="max-w-sm mx-auto rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <GoogleSignInPrompt
            heading="Sign in to save videos"
            subtext="Sign in with Google to save videos and access them from any device."
            compact={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 glass rounded-xl flex items-center justify-center">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Saved Videos</h1>
        </div>
        <p className="text-white/30 text-sm ml-12">{favoriteVideos.length} saved video{favoriteVideos.length !== 1 ? 's' : ''}</p>
      </motion.div>

      {favoriteVideos.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Heart className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-base sm:text-lg font-semibold text-white/40">No saved videos yet</p>
          <p className="text-sm mt-1 mb-7 text-white/25">Click the Save button on any video to add it here.</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Link to="/videos" className="glass-strong px-6 py-3 rounded-full text-white/70 hover:text-white font-medium text-sm transition-all">
              Browse Videos
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {favoriteVideos.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <VideoCard video={v} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
