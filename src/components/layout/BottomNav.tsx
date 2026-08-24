import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Video, Tag, Tv, Search, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../../store/useStore'
import SearchBar from '../ui/SearchBar'

const navLinks = [
  { href: '/',           label: 'Home',       icon: Home },
  { href: '/videos',     label: 'Videos',     icon: Video },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/channels',   label: 'Channels',   icon: Tv },
]

export default function BottomNav() {
  const location = useLocation()
  const { isAdmin } = useStore()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed inset-x-0 bottom-[68px] z-40 px-4 pb-2"
        >
          <div className="glass-strong rounded-2xl p-3 border border-white/[0.09]">
            <SearchBar onSearch={() => setSearchOpen(false)} />
          </div>
        </motion.div>
      )}

      {/* Bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 glass-strong border-t border-white/[0.07]"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around px-2 h-[60px]">

          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = location.pathname === href || (href !== '/' && location.pathname.startsWith(href))
            return (
              <Link
                key={href}
                to={href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
              >
                {active && (
                  <motion.span
                    layoutId="bottomNavPill"
                    className="absolute inset-x-2 inset-y-0 rounded-xl bg-white/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  className={`relative z-10 w-5 h-5 transition-colors ${
                    active ? 'text-[#a78bfa]' : 'text-white/40'
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] font-medium transition-colors ${
                    active ? 'text-[#a78bfa]' : 'text-white/35'
                  }`}
                >
                  {label}
                </span>
              </Link>
            )
          })}

          {/* Search tab */}
          <button
            onClick={() => setSearchOpen(s => !s)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
          >
            <Search className={`w-5 h-5 transition-colors ${searchOpen ? 'text-[#a78bfa]' : 'text-white/40'}`} />
            <span className={`text-[10px] font-medium transition-colors ${searchOpen ? 'text-[#a78bfa]' : 'text-white/35'}`}>
              Search
            </span>
          </button>

          {/* Admin shortcut (only when logged in) */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
            >
              <LayoutDashboard className={`w-5 h-5 transition-colors ${
                location.pathname.startsWith('/admin') ? 'text-[#a78bfa]' : 'text-white/40'
              }`} />
              <span className={`text-[10px] font-medium transition-colors ${
                location.pathname.startsWith('/admin') ? 'text-[#a78bfa]' : 'text-white/35'
              }`}>
                Admin
              </span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
