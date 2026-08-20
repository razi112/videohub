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
  { id: 'hero', label: 'Hero / Featured Video', enabled: true, description: 'Large featured video with play button' },
  { id: 'search', label: 'Search Bar', enabled: true, description: 'Search and category filter' },
  { id: 'latest', label: 'Latest Videos', enabled: true, description: 'Most recently added videos grid' },
  { id: 'popular', label: 'Popular Videos', enabled: true, description: 'Most viewed videos' },
  { id: 'categories', label: 'Categories', enabled: true, description: 'Category browse cards' },
  { id: 'featured', label: 'Featured Collections', enabled: false, description: 'Curated collections showcase' },
]

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<Section[]>(defaultSections)
  const [saved, setSaved] = useState(false)

  const toggle = (id: string) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    toast.success('Homepage layout saved!')
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const next = [...sections]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setSections(next)
    setSaved(false)
  }

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return
    const next = [...sections]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setSections(next)
    setSaved(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Homepage Editor</h1>
      <p className="text-gray-500 text-sm mb-8">Control which sections appear on the homepage and their order.</p>

      <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl overflow-hidden mb-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            layout
            className={`flex items-center gap-4 px-5 py-4 border-b border-[#2a2a3a] last:border-b-0 ${
              section.enabled ? '' : 'opacity-50'
            }`}
          >
            {/* Drag handle (visual) */}
            <div className="flex flex-col gap-0.5 cursor-grab">
              <button onClick={() => moveUp(i)} className="text-gray-600 hover:text-gray-400 transition-colors" title="Move up">▲</button>
              <GripVertical className="w-4 h-4 text-gray-600" />
              <button onClick={() => moveDown(i)} className="text-gray-600 hover:text-gray-400 transition-colors" title="Move down">▼</button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{section.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
            </div>

            <button
              onClick={() => toggle(section.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                section.enabled
                  ? 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30'
                  : 'bg-[#16161e] border-[#2a2a3a] text-gray-500 hover:text-white'
              }`}
            >
              {section.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {section.enabled ? 'Visible' : 'Hidden'}
            </button>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#6c63ff] hover:bg-[#5b53ee] text-white rounded-xl text-sm font-medium transition-colors"
      >
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : 'Save Layout'}
      </button>

      <div className="mt-6 p-4 bg-[#16161e] border border-[#2a2a3a] rounded-xl">
        <p className="text-xs text-gray-500">
          <strong className="text-gray-400">Current order:</strong>{' '}
          {sections.filter((s) => s.enabled).map((s) => s.label).join(' → ')}
        </p>
      </div>
    </div>
  )
}
