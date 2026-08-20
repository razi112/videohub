import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Star, StarOff } from 'lucide-react'
import { getThumbnailUrl } from '../../lib/youtube'
import toast from 'react-hot-toast'
import { useMemo } from 'react'

function VideoCard({ v, isFeatured, onToggle }: { v: any; isFeatured: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: isFeatured ? '0 16px 40px -8px rgba(234,179,8,0.15)' : '0 16px 40px -8px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ willChange: 'transform' }}
      className={`rounded-2xl overflow-hidden border group ${
        isFeatured ? 'bg-[#0d0d14] border-yellow-500/25' : 'bg-[#0d0d14] border-[#1e1e2e]'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          src={v.thumbnail_url || getThumbnailUrl(v.youtube_video_id)}
          alt={v.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isFeatured ? 'opacity-90 group-hover:opacity-100' : 'opacity-60 group-hover:opacity-75'}`}
        />
        {isFeatured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2"
          >
            <span className="bg-yellow-400/90 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Star className="w-2.5 h-2.5 fill-black" /> Featured
            </span>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3">
        <p className="text-white text-xs sm:text-sm font-medium line-clamp-1 mb-2 group-hover:text-[#a78bfa] transition-colors duration-200">
          {v.title}
        </p>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all w-full justify-center border ${
            isFeatured
              ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
          }`}
        >
          {isFeatured
            ? <><StarOff className="w-3 h-3" /> Unfeature</>
            : <><Star className="w-3 h-3" /> Feature This Video</>
          }
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function AdminFeaturedPage() {
  const { videos, updateVideo } = useStore()
  const published    = useMemo(() => videos.filter(v => v.status === 'published'), [videos])
  const featured     = published.filter(v => v.is_featured)
  const nonFeatured  = published.filter(v => !v.is_featured)

  const toggle = (id: string, current: boolean) => {
    updateVideo(id, { is_featured: !current })
    toast.success(!current ? 'Video featured!' : 'Removed from featured')
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Featured Videos</h1>
        <p className="text-gray-500 text-sm mb-6 sm:mb-8">
          Featured videos appear in the homepage hero. <span className="text-yellow-400">{featured.length} currently featured.</span>
        </p>
      </motion.div>

      {/* Currently Featured */}
      <motion.h2
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2"
      >
        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
        Currently Featured ({featured.length})
      </motion.h2>

      {featured.length === 0 ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600 text-sm mb-8">
          No featured videos yet. Feature some from below.
        </motion.p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-10">
          {featured.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
              <VideoCard v={v} isFeatured={true} onToggle={() => toggle(v.id, v.is_featured)} />
            </motion.div>
          ))}
        </div>
      )}

      {/* All Published */}
      <motion.h2
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="text-base sm:text-lg font-semibold text-white mb-4"
      >
        All Published Videos
      </motion.h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {nonFeatured.map((v, i) => (
          <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 + i * 0.05 }}>
            <VideoCard v={v} isFeatured={false} onToggle={() => toggle(v.id, v.is_featured)} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
