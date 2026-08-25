import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import SearchBar from '../ui/SearchBar'

const navLinks = [
  { href: '/',           label: 'Home' },
  { href: '/videos',     label: 'Videos' },
  { href: '/categories', label: 'Categories' },
  { href: '/channels',   label: 'Channels' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isAdmin, currentUser, signOut, setCurrentUser } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    signOut()
    setCurrentUser(null)
    navigate('/')
  }

  const userInitial = currentUser
    ? (currentUser.name?.[0] ?? currentUser.email?.[0] ?? 'U').toUpperCase()
    : null

  return (
    <header className="sticky top-0 z-50">
      {/* Glass bar */}
      <div className="glass-strong border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              <span className="relative z-10 flex items-center justify-center w-full h-full text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
              Video<span className="text-[#a78bfa]">Hub</span>
            </span>
          </Link>

          {/* Desktop pill nav */}
          <nav className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-1.5">
            {navLinks.map(({ href, label }) => {
              const active = location.pathname === href || (href !== '/' && location.pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  to={href}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active ? 'text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="navPill"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/15"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Search + actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block w-52 xl:w-64">
              <SearchBar />
            </div>

            {/* Mobile search toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </motion.button>

            {/* Admin */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-[#a78bfa] text-sm font-medium hover:bg-white/10 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : currentUser ? (
              /* Logged-in regular user */
              <div className="flex items-center gap-1.5">
                <Link
                  to="/account"
                  className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1 glass rounded-full hover:bg-white/10 transition-all"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover"
                      style={{ border: '1.5px solid rgba(167,139,250,0.5)' }}
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
                    >
                      {userInitial}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white/80 max-w-[90px] truncate">
                    {currentUser.name?.split(' ')[0] ?? 'Account'}
                  </span>
                </Link>
                {/* Avatar-only on mobile (sm and below) */}
                <Link to="/account" className="sm:hidden">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                      style={{ border: '2px solid rgba(167,139,250,0.5)' }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
                    >
                      {userInitial}
                    </div>
                  )}
                </Link>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-white/60 text-sm font-medium hover:text-white hover:bg-white/10 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6c63ff]" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </motion.div>
            )}

            {/* Mobile menu */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden px-4 pb-3 overflow-hidden"
            >
              <SearchBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-4 mt-2 glass-strong rounded-2xl overflow-hidden"
          >
            <nav className="p-2 flex flex-col gap-0.5">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === href
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="h-px bg-white/[0.06] my-1" />
              {isAdmin ? (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[#a78bfa] hover:bg-white/5 flex items-center gap-2 transition-all">
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 flex items-center gap-2 transition-all text-left">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : currentUser ? (
                <>
                  {/* User profile row */}
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        style={{ border: '2px solid rgba(167,139,250,0.4)' }} />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}>
                        {userInitial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-white/35 truncate">{currentUser.email}</p>
                    </div>
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 flex items-center gap-2 transition-all text-left">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-[#6c63ff] hover:bg-white/5 flex items-center gap-2 transition-all">
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
