import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import toast from 'react-hot-toast'
import type { Category } from '../../types'

export default function AdminCategoriesPage() {
  const { categories, videos, addCategory, updateCategory, deleteCategory } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const getVideoCount = (catId: string) => videos.filter(v => v.category_id === catId).length

  const resetForm = () => { setName(''); setDescription(''); setEditingId(null); setShowForm(false) }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Category name is required'); return }
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    try {
      if (editingId) {
        await updateCategory(editingId, { name: name.trim(), slug, description: description.trim() })
        toast.success('Category updated')
      } else {
        await addCategory({ name: name.trim(), slug, description: description.trim() })
        toast.success('Category created')
      }
      resetForm()
    } catch {
      toast.error('Failed to save category')
    }
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id); setName(cat.name); setDescription(cat.description || ''); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const count = getVideoCount(id)
    if (!confirm(count > 0 ? `This category has ${count} videos. Delete anyway?` : 'Delete this category?')) return
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete category')
    }
  }

  const inputCls = 'w-full glass rounded-xl px-4 py-2.5 sm:py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#6c63ff]/50 transition-all'

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-white/40 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#080810] rounded-full text-sm font-semibold shadow-lg shadow-white/10 hover:bg-white/90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Category
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative glass rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6 border border-[#6c63ff]/25 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/30 to-transparent pointer-events-none" />
            <h3 className="font-semibold text-white mb-4 text-sm sm:text-base">
              {editingId ? 'Edit Category' : 'New Category'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <label className="block text-xs sm:text-sm text-white/50 mb-2">Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Science"
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-white/50 mb-2">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description"
                  className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#080810] rounded-full text-xs sm:text-sm font-semibold transition-all hover:bg-white/90">
                <Save className="w-3.5 h-3.5" /> {editingId ? 'Update' : 'Create'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 glass text-white/50 hover:text-white rounded-full text-xs sm:text-sm transition-all">
                <X className="w-3.5 h-3.5" /> Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="relative glass rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide">Name</th>
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide hidden sm:table-cell">Slug</th>
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide hidden md:table-cell">Description</th>
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide">Videos</th>
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 px-4 sm:px-5">
                    <span className="text-xs sm:text-sm text-white/80 font-medium">{cat.name}</span>
                  </td>
                  <td className="py-3 px-4 sm:px-5 hidden sm:table-cell">
                    <span className="text-xs text-white/35 font-mono glass px-2 py-0.5 rounded">{cat.slug}</span>
                  </td>
                  <td className="py-3 px-4 sm:px-5 hidden md:table-cell">
                    <span className="text-xs sm:text-sm text-white/40">{cat.description || '—'}</span>
                  </td>
                  <td className="py-3 px-4 sm:px-5">
                    <span className="text-xs sm:text-sm text-white/50">{getVideoCount(cat.id)}</span>
                  </td>
                  <td className="py-3 px-4 sm:px-5">
                    <div className="flex gap-1 sm:gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-white/30 hover:text-[#a78bfa] transition-colors rounded-lg hover:bg-white/[0.06]">
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
