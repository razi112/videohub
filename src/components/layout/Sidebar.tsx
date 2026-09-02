import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Video, Tag, BookMarked, Play, User, LayoutDashboard, Users } from 'lucide-react'
import { useStore } from '../../store/useStore'

interface SidebarProps {
  collapsed: boolean
}

const NAV_ITEMS = [
  { href: '/',           label: 'Home',       icon: Home },
  { href: '/videos',     label: 'Videos',     icon: Video },
  { href: '/shorts',     label: 'Shorts',     icon: Play },
  { href: '/channels',   label: 'Channels',   icon: Users },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/favorites',  label: 'Favorites',  icon: BookMarked },
  { href: '/account',    label: 'Account',    icon: User },
]

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation()
  const { isAdmin, darkMode } = useStore()

  const items = isAdmin
    ? [...NAV_ITEMS, { href: '/admin', label: 'Dashboard', icon: LayoutDashboard }]
    : NAV_ITEMS

  // Palette that flips between dark and light
  const p = darkMode ? {
    panelBg: `linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.04) 40%,rgba(255,255,255,0.03) 70%,rgba(255,255,255,0.05) 100%)`,
    panelBorder: 'rgba(255,255,255,0.09)',
    panelShadow: 'inset 1px 0 0 rgba(255,255,255,0.06),inset -1px 0 0 rgba(255,255,255,0.03),4px 0 32px rgba(0,0,0,0.25)',
    gleam: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.28) 30%,rgba(255,255,255,0.45) 50%,rgba(255,255,255,0.28) 70%,transparent 100%)',
    ambient: 'radial-gradient(ellipse 100% 35% at 50% 0%,rgba(255,255,255,0.04) 0%,transparent 70%)',
    textActive: 'rgba(255,255,255,0.97)',
    textInactive: 'rgba(255,255,255,0.45)',
    iconActive: 'rgba(255,255,255,0.95)',
    iconInactive: 'rgba(255,255,255,0.38)',
    iconFilter: 'drop-shadow(0 0 6px rgba(255,255,255,0.55))',
    activePillBg: `linear-gradient(135deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0.10) 50%,rgba(255,255,255,0.07) 100%)`,
    activePillBorder: 'rgba(255,255,255,0.22)',
    activePillShadow: '0 1px 0 rgba(255,255,255,0.30) inset,0 -1px 0 rgba(255,255,255,0.06) inset,0 4px 24px rgba(255,255,255,0.07),0 0 0 1px rgba(255,255,255,0.06)',
    hoverPillBg: 'rgba(255,255,255,0.05)',
    hoverPillBorder: 'rgba(255,255,255,0.08)',
    hoverPillShadow: '0 1px 0 rgba(255,255,255,0.07) inset',
    accentBar: 'linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(255,255,255,0.55) 100%)',
    accentBarShadow: '0 0 8px rgba(255,255,255,0.6),0 0 18px rgba(255,255,255,0.2)',
    textShadowActive: '0 0 14px rgba(255,255,255,0.35)',
    divider: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08) 30%,rgba(255,255,255,0.13) 50%,rgba(255,255,255,0.08) 70%,transparent)',
  } : {
    panelBg: `linear-gradient(160deg,rgba(255,255,255,0.85) 0%,rgba(255,255,255,0.78) 40%,rgba(255,255,255,0.74) 70%,rgba(255,255,255,0.80) 100%)`,
    panelBorder: 'rgba(0,0,0,0.08)',
    panelShadow: '4px 0 24px rgba(0,0,0,0.08)',
    gleam: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.70) 30%,rgba(255,255,255,0.90) 50%,rgba(255,255,255,0.70) 70%,transparent 100%)',
    ambient: 'radial-gradient(ellipse 100% 35% at 50% 0%,rgba(108,99,255,0.05) 0%,transparent 70%)',
    textActive: 'rgba(20,20,40,0.92)',
    textInactive: 'rgba(20,20,40,0.45)',
    iconActive: 'rgba(20,20,40,0.88)',
    iconInactive: 'rgba(20,20,40,0.38)',
    iconFilter: 'drop-shadow(0 0 4px rgba(108,99,255,0.35))',
    activePillBg: `linear-gradient(135deg,rgba(108,99,255,0.14) 0%,rgba(108,99,255,0.08) 50%,rgba(108,99,255,0.06) 100%)`,
    activePillBorder: 'rgba(108,99,255,0.28)',
    activePillShadow: '0 1px 0 rgba(255,255,255,0.80) inset,0 -1px 0 rgba(0,0,0,0.04) inset,0 4px 16px rgba(108,99,255,0.10)',
    hoverPillBg: 'rgba(0,0,0,0.05)',
    hoverPillBorder: 'rgba(0,0,0,0.07)',
    hoverPillShadow: '0 1px 0 rgba(255,255,255,0.60) inset',
    accentBar: 'linear-gradient(180deg,#6c63ff 0%,#a78bfa 100%)',
    accentBarShadow: '0 0 8px rgba(108,99,255,0.50),0 0 18px rgba(108,99,255,0.20)',
    textShadowActive: 'none',
    divider: 'linear-gradient(90deg,transparent,rgba(0,0,0,0.07) 30%,rgba(0,0,0,0.12) 50%,rgba(0,0,0,0.07) 70%,transparent)',
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 224 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col shrink-0 overflow-hidden relative"
      style={{
        height: '100%',
        position: 'sticky',
        top: 64,
        background: p.panelBg,
        backdropFilter: 'blur(48px) saturate(220%) brightness(1.06)',
        WebkitBackdropFilter: 'blur(48px) saturate(220%) brightness(1.06)',
        borderRight: `1px solid ${p.panelBorder}`,
        boxShadow: p.panelShadow,
      }}
    >
      {/* Top edge gleam */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
        style={{ background: p.gleam }} />
      {/* Subtle top ambient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: p.ambient }} />

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
                color: active ? p.textActive : p.textInactive,
              }}
            >
              {/* Active liquid glass pill */}
              {active && (
                <motion.span
                  layoutId="sidebarActive"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: p.activePillBg,
                    backdropFilter: 'blur(20px) saturate(180%) brightness(1.15)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%) brightness(1.15)',
                    border: `1px solid ${p.activePillBorder}`,
                    boxShadow: p.activePillShadow,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              {/* Hover glass pill (inactive) */}
              {!active && (
                <span
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: p.hoverPillBg,
                    border: `1px solid ${p.hoverPillBorder}`,
                    boxShadow: p.hoverPillShadow,
                  }}
                />
              )}

              {/* Left accent bar */}
              {active && (
                <motion.span
                  layoutId="sidebarAccent"
                  className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full"
                  style={{
                    background: p.accentBar,
                    boxShadow: p.accentBarShadow,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              {/* Icon */}
              <Icon
                className="relative z-10 shrink-0 transition-all duration-200"
                style={{
                  width: 20, height: 20,
                  strokeWidth: active ? 2.2 : 1.8,
                  color: active ? p.iconActive : p.iconInactive,
                  filter: active ? p.iconFilter : 'none',
                }}
              />

              {/* Label */}
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
                      color: active ? p.textActive : p.textInactive,
                      textShadow: active ? p.textShadowActive : 'none',
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
        <div className="my-2 mx-2 h-px"
          style={{ background: p.divider }} />
      </nav>
    </motion.aside>
  )
}
