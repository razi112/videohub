import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Video, PlusCircle, FileText, Star,
  Tag, Users, BarChart2, Home, Settings, Menu, X, LogOut, ChevronRight, Tv2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Toaster } from 'react-hot-toast'

const navItems = [
  { label: 'Overview',    icon: LayoutDashboard, href: '/admin' },
  { label: 'All Videos',  icon: Video,           href: '/admin/videos' },
  { label: 'Add Video',   icon: PlusCircle,      href: '/admin/videos/add' },
  { label: 'Drafts',      icon: FileText,        href: '/admin/drafts' },
  { label: 'Featured',    icon: Star,            href: '/admin/featured' },
  { label: 'Channels',    icon: Tv2,             href: '/admin/channels' },
  { label: 'Add Channel', icon: PlusCircle,      href: '/admin/channels/add' },
  { label: 'Categories',  icon: Tag,             href: '/admin/categories' },
  { label: 'Users',       icon: Users,           href: '/admin/users' },
  { label: 'Analytics',   icon: BarChart2,       href: '/admin/analytics' },
  { label: 'Homepage',    icon: Home,            href: '/admin/homepage' },
  { label: 'Settings',    icon: Settings,        href: '/admin/settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isAdmin, setCurrentUser } = useStore()

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setSidebarOpen(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [location.pathname])

  if (!isAdmin) return <Navigate to="/login" replace />

  const handleLogout = () => setCurrentUser(null)

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col"
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-[#1e1e2e] shrink-0">
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] rounded-lg flex items-center justify-center shadow-md shadow-[#6c63ff]/30">
                    <span className="text-white font-bold text-xs">V</span>
                  </div>
                  <span className="text-white font-bold tracking-tight">Video<span className="text-[#6c63ff]">Hub</span></span>
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-gray-600 hover:text-white rounded-lg hover:bg-[#1e1e2e] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
              {navItems.map((item, i) => {
                const active = location.pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <Link to={item.href} className="block">
                      <motion.div
                        whileHover={!active ? { x: 4, backgroundColor: '#16161e' } : {}}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative overflow-hidden ${
                          active
                            ? 'bg-[#6c63ff]/15 text-[#a78bfa]'
                            : 'text-gray-500'
                        }`}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6c63ff] rounded-full"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <motion.div
                          animate={{ color: active ? '#a78bfa' : undefined }}
                          whileHover={{ rotate: active ? 0 : [0, -8, 8, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                        </motion.div>
                        <span className={active ? 'text-[#a78bfa]' : ''}>{item.label}</span>
                        {active && (
                          <motion.div
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-auto"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-[#6c63ff]/60" />
                          </motion.div>
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[#1e1e2e] shrink-0">
              <motion.button
                whileHover={{ x: 3, color: '#f87171' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.18 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-500/8 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-280 ${sidebarOpen ? 'lg:ml-64' : ''}`}>

        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 sm:h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#1e1e2e] flex items-center gap-3 px-3 sm:px-5">
          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: '#16161e' }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 rounded-lg transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 0 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5" />
            </motion.div>
          </motion.button>

          <span className="text-white font-semibold text-sm sm:text-base truncate">Admin Dashboard</span>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.15 }}>
              <Link to="/" className="text-xs sm:text-sm text-gray-500 hover:text-[#a78bfa] transition-colors whitespace-nowrap flex items-center gap-1">
                ← View Site
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1, color: '#f87171' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="sm:hidden p-2 text-gray-500 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-5 lg:p-7">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#16161e', color: '#f1f1f1', border: '1px solid #2a2a3a', fontSize: '14px', borderRadius: '12px' },
        }}
      />
    </div>
  )
}
