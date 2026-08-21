import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Database, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const inputCls = 'w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#6c63ff]/50 transition-all'

export default function AdminSettingsPage() {
  const [siteName, setSiteName]       = useState('VideoHub')
  const [siteTagline, setSiteTagline] = useState('Learn Something New Today')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')

  const handleSave = () => toast.success('Settings saved!')

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">Settings</h1>
      <p className="text-white/40 text-sm mb-8">Configure your VideoHub installation</p>

      <div className="space-y-5">
        {/* Site Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative glass rounded-2xl p-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-[#a78bfa]" />
            <h3 className="font-semibold text-white">Site Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-2">Site Name</label>
              <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Tagline</label>
              <input type="text" value={siteTagline} onChange={e => setSiteTagline(e.target.value)} className={inputCls} />
            </div>
          </div>
        </motion.div>

        {/* Supabase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative glass rounded-2xl p-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-5">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white">Supabase Configuration</h3>
          </div>
          <div className="relative glass rounded-xl p-3 mb-4 border border-emerald-500/20 overflow-hidden">
            <p className="text-xs text-emerald-400">
              Add your Supabase credentials in <code className="glass px-1 rounded font-mono">. env</code> as{' '}
              <code className="glass px-1 rounded font-mono">VITE_SUPABASE_URL</code> and{' '}
              <code className="glass px-1 rounded font-mono">VITE_SUPABASE_ANON_KEY</code>
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-2">Supabase Project URL</label>
              <input type="text" value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Supabase Anon Key</label>
              <input type="password" value={supabaseKey} onChange={e => setSupabaseKey(e.target.value)}
                placeholder="eyJ..." className={inputCls} />
            </div>
          </div>
        </motion.div>

        {/* YouTube */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="relative glass rounded-2xl p-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-400 font-bold text-sm">▶</span>
            <h3 className="font-semibold text-white">YouTube Integration</h3>
          </div>
          <div className="relative glass rounded-xl p-4 text-sm text-white/50 space-y-2 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <p>✅ YouTube IFrame embed — active (no API key required)</p>
            <p>✅ Privacy-enhanced mode (youtube-nocookie.com)</p>
            <p>✅ Responsive 16:9 player</p>
            <p>✅ Fullscreen support</p>
            <p className="text-white/25 text-xs mt-3">
              Optional: Add VITE_YOUTUBE_API_KEY to .env for automatic metadata fetching.
            </p>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#080810] rounded-full text-sm font-semibold shadow-lg shadow-white/10 hover:bg-white/90 transition-all"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </motion.button>
      </div>
    </div>
  )
}
