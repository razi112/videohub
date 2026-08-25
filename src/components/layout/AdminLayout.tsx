import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Video, PlusCircle, FileText, Star,
  Tag, Users, BarChart2, Home, Settings, Menu, X, LogOut, ChevronRight, Tv2,
  Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { verifyAdminAccess } from '../../lib/auth'
import { Toaster } from 'react-hot-toast'

const navItems = [
  { label: 'Overview',    icon: LayoutDashboard, href: '/admin' },
  { label: 'All Videos',  icon: Video,           href: '/admin/videos' },
  { label: 'Add Video',   icon: PlusCircle,      href: '/admin/videos/add' },
  { label: 'Drafts',      icon: FileText,        href: '/admin/drafts' },
  { label: 'Featured',    icon: Star,            href: '/admin/featured' },
  { label: 'Channels',    icon: Tv2,             href: '/admin/channels' },
  { label: 'Add Channel', icon: PlusCircle,      href: '/admin/channels/add', comingSoon: true },
  { label: 'Categories',  icon: Tag,             href: '/admin/categories' },
  { label: 'Users',       icon: Users,           href: '/admin/users' },
  { label: 'Analytics',   icon: BarChart2,       href: '/admin/analytics' },
  { label: 'Homepage',    icon: Home,            href: '/admin/homepage' },
  { label: 'Settings',    icon: Settings,        href: '/admin/settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isAdmin, roleLoading, signOut } = useStore()

  // Server-side guard: independently verify admin access via Supabase,
  // regardless of what's in the Zustand store (prevents spoofing via
  // localStorage manipulation).
  const [serverVerified, setServerVerified] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    verifyAdminAccess().then((ok) => {
      if (!cancelled) setServerVerified(ok)
    })
    return () => { cancelled = true }
  }, [])

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

  // ── Loading state: wait for both store + server verification ──
  if (roleLoading || serverVerified === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#a78bfa] animate-spin" />
          <p className="text-white/40 text-sm">Verifying access…</p>
        </div>
      </div>
    )
  }

  // ── Access denied: redirect to account page ──
  // Both the store value AND the fresh DB query must agree.
  if (!isAdmin || !serverVerified) {
    return <Navigate to="/account" replace />
  }

  const handleLogout = () => signOut()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 left-0 bottom-0 z-40 w-64 glass-strong border-r border-white/[0.07] flex flex-col"
          >
            {/* Top gleam */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.07] shrink-0">
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] opacity-90" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                    <span className="relative z-10 flex items-center justify-center w-full h-full text-white font-bold text-sm">V</span>
                  </div>
                  <span className="text-white font-semibold text-lg tracking-tight">
                    Video<span className="text-[#a78bfa]">Hub</span>
                  </span>
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
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
                        whileHover={!active ? { x: 3 } : {}}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors overflow-hidden ${
                          active
                            ? 'bg-white/10 text-white border border-white/15'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05] border border-transparent'
                        }`}
                      >
                        {/* Active inner top gleam */}
                        {active && (
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none rounded-xl" />
                        )}
                        {/* Active left bar */}
                        {active && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-[#a78bfa] to-[#6c63ff] rounded-full"
                            style={{ boxShadow: '0 0 8px rgba(108,99,255,0.7)' }}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                        {item.comingSoon && !active && (
                          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full glass text-[#a78bfa] border border-[#6c63ff]/25 leading-none">
                            Soon
                          </span>
                        )}
                        {active && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto">
                            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                          </motion.div>
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-white/[0.07] shrink-0">
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.18 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all"
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
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>

        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-strong border-b border-white/[0.07] h-16 flex items-center gap-3 px-4 sm:px-6">
          {/* Top gleam */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </motion.button>

          <span className="text-white font-semibold text-sm sm:text-base tracking-tight truncate">Admin Dashboard</span>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 transition-all"
              >
                ← View Site
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="sm:hidden w-9 h-9 glass rounded-full flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
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
          style: {
            background: 'rgba(15,15,26,0.85)',
            backdropFilter: 'blur(24px)',
            color: '#f0f0ff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '14px',
            borderRadius: '14px',
          },
        }}
      />
    </div>
  )
}
