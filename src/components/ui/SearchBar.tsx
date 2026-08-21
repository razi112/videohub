import { Search, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchBar({ className = '' }: { className?: string }) {
  const { searchQuery, setSearchQuery } = useStore()

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search videos..."
        className="w-full glass rounded-full pl-10 pr-10 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
      />
      <AnimatePresence>
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
