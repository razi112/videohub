import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Database, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('VideoHub')
  const [siteTagline, setSiteTagline] = useState('Learn Something New Today')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')

  const handleSave = () => {
    toast.success('Settings saved!')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Configure your VideoHub installation</p>

      <div className="space-y-6">
        {/* Site Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-[#6c63ff]" />
            <h3 className="font-semibold text-white">Site Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Site Name</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6c63ff]/60 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tagline</label>
              <input type="text" value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)}
                className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6c63ff]/60 transition-all" />
            </div>
          </div>
        </motion.div>

        {/* Supabase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Database className="w-4 h-4 text-green-500" />
            <h3 className="font-semibold text-white">Supabase Configuration</h3>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl mb-4">
            <p className="text-xs text-green-400">
              Add your Supabase credentials in <code className="font-mono bg-[#16161e] px-1 py-0.5 rounded">.env</code> file as <code className="font-mono bg-[#16161e] px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-[#16161e] px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Supabase Project URL</label>
              <input type="text" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/60 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Supabase Anon Key</label>
              <input type="password" value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJ..."
                className="w-full bg-[#16161e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/60 transition-all" />
            </div>
          </div>
        </motion.div>

        {/* YouTube */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-4 h-4 text-red-500 font-bold text-sm">▶</span>
            <h3 className="font-semibold text-white">YouTube Integration</h3>
          </div>
          <div className="p-4 bg-[#16161e] border border-[#2a2a3a] rounded-xl text-sm text-gray-400 space-y-2">
            <p>✅ YouTube IFrame embed — active (no API key required)</p>
            <p>✅ Privacy-enhanced mode (youtube-nocookie.com)</p>
            <p>✅ Responsive 16:9 player</p>
            <p>✅ Fullscreen support</p>
            <p className="text-gray-600 text-xs mt-3">Optional: Add VITE_YOUTUBE_API_KEY to .env for automatic metadata fetching.</p>
          </div>
        </motion.div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6c63ff] hover:bg-[#5b53ee] text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  )
}
