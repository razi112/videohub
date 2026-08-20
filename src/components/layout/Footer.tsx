import { Link } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#111118] border-t border-[#2a2a3a] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-white font-bold text-lg">Video<span className="text-[#6c63ff]">Hub</span></span>
            </Link>
            <p className="text-sm text-gray-500">
              An admin-controlled YouTube video portal. Discover, watch, and learn.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Browse</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/videos" className="hover:text-white transition-colors">All Videos</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/favorites" className="hover:text-white transition-colors">Favorites</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Info</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-red-500" />
                Videos powered by YouTube
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Admin Area</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a2a3a] pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} VideoHub. All rights reserved.</p>
          <p>Built with React + Supabase + YouTube IFrame API</p>
        </div>
      </div>
    </footer>
  )
}
