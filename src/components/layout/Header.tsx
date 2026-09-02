import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, LayoutDashboard, LogOut, ShieldCheck, LogIn, PanelLeft, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import SearchBar from '../ui/SearchBar'

const mobileNavLinks = [
  { href: '/',           label: 'Home' },
  { href: '/videos',     label: 'Videos' },
  { href: '/shorts',     label: 'Shorts' },
  { href: '/categories', label: 'Categories' },
  { href: '/channels',   label: 'Channels' },
  { href: '/favorites',  label: 'Favorites' },
]

interface HeaderProps {
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export default function Header({ sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isAdmin, currentUser, signOut, setCurrentUser, darkMode, toggleDarkMode } = useStore()
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
      <div className="glass-strong border-b border-white/[0.07]">
        <div className="max-w-none px-3 sm:px-4 h-16 flex items-center gap-3">

          {/* ── Sidebar toggle + Logo ── */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleSidebar && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggleSidebar}
                className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-all"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <PanelLeft
                  className="w-5 h-5 transition-transform duration-300"
                  style={{ transform: sidebarCollapsed ? 'scaleX(-1)' : 'scaleX(1)' }}
                />
              </motion.button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group ml-1">
              <div className="relative w-8 h-8 shrink-0">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                <span className="relative z-10 flex items-center justify-center w-full h-full text-white font-bold text-sm">V</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
                Video<span className="text-[#a78bfa]">Hub</span>
              </span>
            </Link>
          </div>

          {/* ── Search bar ── */}
          <div className="flex-1 hidden lg:flex justify-center">
            <div className="w-full max-w-md">
              <SearchBar />
            </div>
          </div>

          <div className="flex-1 hidden md:block lg:hidden" />

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">

            <motion.button whileTap={{ scale: 0.9 }}
              className="md:hidden w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <Search className="w-4 h-4" />
            </motion.button>

            <motion.button whileTap={{ scale: 0.9 }}
              className="hidden md:flex lg:hidden w-9 h-9 glass rounded-full items-center justify-center text-white/60 hover:text-white transition-colors"
              onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <Search className="w-4 h-4" />
            </motion.button>

            {/* ── Dark / Light toggle ── */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="w-9 h-9 glass rounded-full flex items-center justify-center transition-colors"
              style={{ color: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(30,30,60,0.65)' }}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </motion.button>

            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <Link to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-white/70 text-sm font-medium hover:text-white hover:bg-white/10 transition-all">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleLogout}
                  className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                  aria-label="Sign out">
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-1.5">
                <Link to="/account"
                  className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1 glass rounded-full hover:bg-white/10 transition-all">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover"
                      style={{ border: '1.5px solid rgba(255,255,255,0.3)' }} />
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))' }}>
                      {userInitial}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white/80 max-w-[90px] truncate">
                    {currentUser.name?.split(' ')[0] ?? 'Account'}
                  </span>
                </Link>
                <Link to="/account" className="sm:hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                      style={{ border: '2px solid rgba(255,255,255,0.25)' }} />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))' }}>
                      {userInitial}
                    </div>
                  )}
                </Link>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleLogout}
                  className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                  aria-label="Sign out">
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-white/60 text-sm font-medium hover:text-white hover:bg-white/10 transition-all">
                  <LogIn className="w-3.5 h-3.5 text-white/60" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </motion.div>
            )}

            <motion.button whileTap={{ scale: 0.9 }}
              className="md:hidden w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Search row */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="px-4 pb-3 overflow-hidden">
              <SearchBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="md:hidden mx-4 mt-2 glass-strong rounded-2xl overflow-hidden">
            <nav className="p-2 flex flex-col gap-0.5">
              {mobileNavLinks.map(({ href, label }) => (
                <Link key={href} to={href} onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === href
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}>
                  {label}
                </Link>
              ))}
              <div className="h-px bg-white/[0.06] my-1" />
              {isAdmin ? (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all">
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 flex items-center gap-2 transition-all text-left w-full">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : currentUser ? (
                <>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        style={{ border: '2px solid rgba(255,255,255,0.2)' }} />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))' }}>
                        {userInitial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-white/35 truncate">{currentUser.email}</p>
                    </div>
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 flex items-center gap-2 transition-all text-left w-full">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all">
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
