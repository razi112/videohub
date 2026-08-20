import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import SearchBar from '../ui/SearchBar'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isAdmin, setCurrentUser } = useStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    setCurrentUser(null)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
            Video<span className="text-[#6c63ff]">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
          <Link to="/videos" className="text-sm text-gray-400 hover:text-white transition-colors">Videos</Link>
          <Link to="/categories" className="text-sm text-gray-400 hover:text-white transition-colors">Categories</Link>
          <Link to="/channels" className="text-sm text-gray-400 hover:text-white transition-colors">Channels</Link>
        </nav>

        {/* Search bar desktop */}
        <div className="hidden lg:block flex-1 max-w-sm">
          <SearchBar />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Mobile search */}
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Admin logged in — Dashboard + Logout */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6c63ff]/20 text-[#a78bfa] text-sm hover:bg-[#6c63ff]/30 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Admin button — always visible when not logged in */
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a3a] bg-[#111118] text-gray-400 text-sm hover:text-white hover:border-[#6c63ff]/50 hover:bg-[#6c63ff]/10 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[#6c63ff]" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </motion.div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[#2a2a3a] px-4 py-3"
          >
            <SearchBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#2a2a3a] bg-[#0a0a0f]"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              <Link to="/" className="text-gray-300 hover:text-white py-2.5 border-b border-[#1a1a24]" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/videos" className="text-gray-300 hover:text-white py-2.5 border-b border-[#1a1a24]" onClick={() => setMobileMenuOpen(false)}>Videos</Link>
              <Link to="/categories" className="text-gray-300 hover:text-white py-2.5 border-b border-[#1a1a24]" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
              <Link to="/channels" className="text-gray-300 hover:text-white py-2.5 border-b border-[#1a1a24]" onClick={() => setMobileMenuOpen(false)}>Channels</Link>
              {isAdmin ? (
                <>
                  <Link to="/admin" className="text-[#a78bfa] hover:text-white py-2.5 border-b border-[#1a1a24] flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="text-left text-red-400 hover:text-red-300 py-2.5 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-[#6c63ff] hover:text-[#a78bfa] py-2.5 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <ShieldCheck className="w-4 h-4" /> Admin Login
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
