import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function CategoryFilter() {
  const categories = useStore(s => s.categories)
  const selectedCategory = useStore(s => s.selectedCategory)
  const setSelectedCategory = useStore(s => s.setSelectedCategory)

  const all = useMemo(
    () => [{ id: '', name: 'All', slug: '' }, ...categories],
    [categories]
  )

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      {all.map((cat) => (
        <motion.button
          key={cat.id}
          whileTap={{ scale: 0.94 }}
          onClick={() => setSelectedCategory(cat.id)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 border ${
            selectedCategory === cat.id
              ? 'bg-white/15 border-white/25 text-white shadow-lg shadow-black/20'
              : 'glass border-white/[0.07] text-white/45 hover:text-white/75 hover:bg-white/[0.07]'
          }`}
        >
          {cat.name}
        </motion.button>
      ))}
    </div>
  )
}
