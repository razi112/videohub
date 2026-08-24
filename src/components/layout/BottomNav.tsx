import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Compass, Search, Heart, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../../store/useStore'
import SearchBar from '../ui/SearchBar'

interface NavItem {
  id: string
  href?: string
  label: string
  icon: React.ElementType
  action?: 'search'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',     href: '/',          label: 'Home',    icon: Home },
  { id: 'explore',  href: '/videos',    label: 'Explore', icon: Compass },
  { id: 'search',                       label: 'Search',  icon: Search, action: 'search' },
  { id: 'favorites',href: '/favorites', label: 'Saved',   icon: Heart },
  { id: 'profile',  href: '/login',     label: 'Profile', icon: ShieldCheck },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { isAdmin, searchQuery, setSearchQuery } = useStore()
  const [searchOpen, setSearchOpen] = useState(false)

  function isActive(item: NavItem) {
    if (!item.href) return false
    if (item.href === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.href)
  }

  function handleItem(item: NavItem) {
    if (item.action === 'search') {
      if (searchOpen) {
        setSearchQuery('')
        setSearchOpen(false)
      } else {
        setSearchOpen(true)
      }
      return
    }
    if (item.href) navigate(item.href)
  }

  // Replace Profile tab with Admin when logged in as admin
  const items = NAV_ITEMS.map(item =>
    item.id === 'profile' && isAdmin
      ? { ...item, href: '/admin', label: 'Admin', icon: ShieldCheck }
      : item
  )

  return (
    <>
      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSearchOpen(false); setSearchQuery('') }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            {/* Search panel */}
            <motion.div
              key="search-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-x-3 z-50"
              style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}
            >
              <div
                className="rounded-2xl p-3"
                style={{
                  background: 'rgba(15,15,26,0.92)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <SearchBar onSearch={() => setSearchOpen(false)} />
                  </div>
                  <button
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 md:hidden"
        style={{
          background: 'rgba(8,8,16,0.85)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px 20px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top gleam line */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.5) 40%, rgba(167,139,250,0.5) 60%, transparent)',
          }}
        />

        <div className="flex items-center justify-around px-1" style={{ height: '62px' }}>
          {items.map((item) => {
            const active = item.action === 'search'
              ? searchOpen || (searchQuery.length > 0)
              : isActive(item)
            const Icon = item.icon

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleItem(item)}
                className="relative flex flex-col items-center justify-center gap-[3px] flex-1 h-full"
                aria-label={item.label}
              >
                {/* Active background pill */}
                {active && (
                  <motion.span
                    layoutId="bottomNavActive"
                    className="absolute inset-x-1.5 top-2 bottom-1 rounded-2xl"
                    style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.2)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10">
                  <Icon
                    className="transition-all duration-200"
                    style={{
                      width: '22px',
                      height: '22px',
                      color: active ? '#a78bfa' : 'rgba(255,255,255,0.35)',
                      filter: active ? 'drop-shadow(0 0 6px rgba(167,139,250,0.6))' : 'none',
                      strokeWidth: active ? 2.2 : 1.8,
                    }}
                  />
                  {/* Active dot */}
                  {active && (
                    <motion.span
                      layoutId={`dot-${item.id}`}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="relative z-10 font-medium transition-all duration-200"
                  style={{
                    fontSize: '10px',
                    color: active ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                    letterSpacing: active ? '0.01em' : '0',
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
