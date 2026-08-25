import { Search, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  className?: string
  onSearch?: () => void
}

export default function SearchBar({ className = '', onSearch }: SearchBarProps) {
  const { searchQuery, setSearchQuery } = useStore()

  // Local input state — updates instantly for responsive feel
  const [localValue, setLocalValue] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local in sync if store is cleared externally (e.g. clear button elsewhere)
  useEffect(() => {
    setLocalValue(searchQuery)
  }, [searchQuery])

  function handleChange(value: string) {
    setLocalValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value)
      onSearch?.()
    }, 250)
  }

  function handleClear() {
    setLocalValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearchQuery('')
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Search icon */}
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c63ff]/70 group-focus-within:text-[#6c63ff] transition-colors duration-200" />

      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search videos..."
        className="w-full pl-10 pr-10 py-2.5 text-sm text-white/90 placeholder-white/30
          rounded-2xl outline-none transition-all duration-200
          bg-white/[0.06] border border-white/10
          focus:bg-white/[0.1] focus:border-[#6c63ff]/60
          focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)]"
      />

      {/* Clear button */}
      <AnimatePresence>
        {localValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center
              rounded-full bg-white/10 hover:bg-[#6c63ff]/40 text-white/50 hover:text-white transition-all duration-150"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
