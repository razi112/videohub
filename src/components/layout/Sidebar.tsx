import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Video, Tag, BookMarked, Play, User, LayoutDashboard } from 'lucide-react'
import { useStore } from '../../store/useStore'

interface SidebarProps {
  collapsed: boolean
}

const NAV_ITEMS = [
  { href: '/',           label: 'Home',       icon: Home },
  { href: '/videos',     label: 'Videos',     icon: Video },
  { href: '/shorts',     label: 'Shorts',     icon: Play },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/favorites',  label: 'Favorites',  icon: BookMarked },
  { href: '/account',    label: 'Account',    icon: User },
]

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation()
  const { isAdmin } = useStore()

  const items = isAdmin
    ? [...NAV_ITEMS, { href: '/admin', label: 'Dashboard', icon: LayoutDashboard }]
    : NAV_ITEMS

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 224 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col shrink-0 overflow-hidden relative"
      style={{
        height: '100%',
        position: 'sticky',
        top: 64,
        /* Liquid glass panel */
        background: `
          linear-gradient(
            160deg,
            rgba(255,255,255,0.07) 0%,
            rgba(255,255,255,0.04) 40%,
            rgba(255,255,255,0.03) 70%,
            rgba(255,255,255,0.05) 100%
          )
        `,
        backdropFilter: 'blur(48px) saturate(220%) brightness(1.06)',
        WebkitBackdropFilter: 'blur(48px) saturate(220%) brightness(1.06)',
        borderRight: '1px solid rgba(255,255,255,0.09)',
        boxShadow: `
          inset 1px 0 0 rgba(255,255,255,0.06),
          inset -1px 0 0 rgba(255,255,255,0.03),
          4px 0 32px rgba(0,0,0,0.25)
        `,
      }}
    >
      {/* Top edge gleam */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 30%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.28) 70%, transparent 100%)',
        }}
      />
      {/* Subtle top ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 35% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Scrollable nav area */}
      <nav className="flex flex-col gap-0.5 px-2 pt-3 pb-4 overflow-y-auto flex-1 overflow-x-hidden scrollbar-none relative z-10">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(href)

          return (
            <Link
              key={href}
              to={href}
              title={collapsed ? label : undefined}
              className="relative flex items-center gap-3 rounded-2xl transition-colors duration-150 group"
              style={{
                padding: collapsed ? '11px 0' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              {/* ── Active liquid glass pill — pure white frosted ── */}
              {active && (
                <motion.span
                  layoutId="sidebarActive"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `
                      linear-gradient(
                        135deg,
                        rgba(255,255,255,0.18) 0%,
                        rgba(255,255,255,0.10) 50%,
                        rgba(255,255,255,0.07) 100%
                      )
                    `,
                    backdropFilter: 'blur(20px) saturate(180%) brightness(1.15)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%) brightness(1.15)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    boxShadow: `
                      0 1px 0 rgba(255,255,255,0.30) inset,
                      0 -1px 0 rgba(255,255,255,0.06) inset,
                      0 4px 24px rgba(255,255,255,0.07),
                      0 0 0 1px rgba(255,255,255,0.06)
                    `,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              {/* ── Hover glass pill (inactive) ── */}
              {!active && (
                <span
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset',
                  }}
                />
              )}

              {/* ── Left accent bar — bright white ── */}
              {active && (
                <motion.span
                  layoutId="sidebarAccent"
                  className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 100%)',
                    boxShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 18px rgba(255,255,255,0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              {/* ── Icon ── */}
              <Icon
                className="relative z-10 shrink-0 transition-all duration-200"
                style={{
                  width: 20,
                  height: 20,
                  strokeWidth: active ? 2.2 : 1.8,
                  color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)',
                  filter: active
                    ? 'drop-shadow(0 0 6px rgba(255,255,255,0.55))'
                    : 'none',
                }}
              />

              {/* ── Label ── */}
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="relative z-10 text-sm font-medium whitespace-nowrap"
                    style={{
                      color: active ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.45)',
                      textShadow: active ? '0 0 14px rgba(255,255,255,0.35)' : 'none',
                    }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}

        {/* Divider */}
        <div
          className="my-2 mx-2 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.08) 70%, transparent)',
          }}
        />
      </nav>
    </motion.aside>
  )
}
