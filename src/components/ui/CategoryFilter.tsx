import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory } = useStore()

  const all = [{ id: '', name: 'All', slug: '' }, ...categories]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {all.map((cat) => (
        <motion.button
          key={cat.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(cat.id)}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            selectedCategory === cat.id
              ? 'bg-[#6c63ff] border-[#6c63ff] text-white shadow-lg shadow-[#6c63ff]/30'
              : 'bg-[#16161e] border-[#2a2a3a] text-gray-400 hover:text-white hover:border-[#6c63ff]/40'
          }`}
        >
          {cat.name}
        </motion.button>
      ))}
    </div>
  )
}
