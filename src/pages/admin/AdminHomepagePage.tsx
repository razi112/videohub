import { useState } from 'react'
import { motion } from 'framer-motion'
import { GripVertical, Eye, EyeOff, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Section {
  id: string
  label: string
  enabled: boolean
  description: string
}

const defaultSections: Section[] = [
  { id: 'hero',       label: 'Hero / Featured Video',  enabled: true,  description: 'Large featured video with play button' },
  { id: 'search',     label: 'Search Bar',             enabled: true,  description: 'Search and category filter' },
  { id: 'latest',     label: 'Latest Videos',          enabled: true,  description: 'Most recently added videos grid' },
  { id: 'popular',    label: 'Popular Videos',         enabled: true,  description: 'Most viewed videos' },
  { id: 'categories', label: 'Categories',             enabled: true,  description: 'Category browse cards' },
  { id: 'featured',   label: 'Featured Collections',  enabled: false, description: 'Curated collections showcase' },
]

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<Section[]>(defaultSections)
  const [saved, setSaved] = useState(false)

  const toggle = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    toast.success('Homepage layout saved!')
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const next = [...sections];
    [next[index - 1], next[index]] = [next[index], next[index - 1]]
    setSections(next); setSaved(false)
  }

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return
    const next = [...sections];
    [next[index], next[index + 1]] = [next[index + 1], next[index]]
    setSections(next); setSaved(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">Homepage Editor</h1>
      <p className="text-white/40 text-sm mb-8">Control which sections appear on the homepage and their order.</p>

      <div className="relative glass rounded-2xl overflow-hidden mb-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            layout
            className={`flex items-center gap-4 px-5 py-4 border-b border-white/[0.06] last:border-b-0 transition-opacity ${
              section.enabled ? '' : 'opacity-45'
            }`}
          >
            {/* Drag handle */}
            <div className="flex flex-col items-center gap-0.5 cursor-grab shrink-0">
              <button onClick={() => moveUp(i)} className="text-white/20 hover:text-white/50 transition-colors text-xs leading-none">▲</button>
              <GripVertical className="w-4 h-4 text-white/20" />
              <button onClick={() => moveDown(i)} className="text-white/20 hover:text-white/50 transition-colors text-xs leading-none">▼</button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80">{section.label}</p>
              <p className="text-xs text-white/35 mt-0.5">{section.description}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => toggle(section.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium glass transition-all shrink-0 ${
                section.enabled
                  ? 'text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/15'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {section.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {section.enabled ? 'Visible' : 'Hidden'}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#080810] rounded-full text-sm font-semibold shadow-lg shadow-white/10 hover:bg-white/90 transition-all"
      >
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : 'Save Layout'}
      </motion.button>

      <div className="relative mt-6 glass rounded-xl p-4 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        <p className="text-xs text-white/35">
          <strong className="text-white/50">Current order:</strong>{' '}
          {sections.filter(s => s.enabled).map(s => s.label).join(' → ')}
        </p>
      </div>
    </div>
  )
}
