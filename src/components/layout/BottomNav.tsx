import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Play, Search, Bookmark, User } from 'lucide-react'
import { useStore } from '../../store/useStore'

interface NavItem {
  id: string
  href?: string
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',    href: '/',          label: 'Home',    icon: Home },
  { id: 'shorts',  href: '/shorts',    label: 'Shorts',  icon: Play },
  { id: 'search',  href: '/videos',    label: 'Search',  icon: Search },
  { id: 'saved',   href: '/favorites', label: 'Saved',   icon: Bookmark },
  { id: 'account', href: '/account',   label: 'Account', icon: User },
]

/* ── Mini avatar shown on the Account tab when signed in ── */
function AccountTabIcon({ active }: { active: boolean }) {
  const { currentUser } = useStore()

  if (!currentUser) {
    return (
      <User
        style={{
          width: '22px',
          height: '22px',
          color: active ? '#a78bfa' : 'rgba(255,255,255,0.35)',
          filter: active ? 'drop-shadow(0 0 6px rgba(167,139,250,0.6))' : 'none',
          strokeWidth: active ? 2.2 : 1.8,
        }}
      />
    )
  }

  const initial = (currentUser.name?.[0] ?? currentUser.email?.[0] ?? 'U').toUpperCase()

  return (
    <div
      className="relative"
      style={{
        width: '26px',
        height: '26px',
        filter: active ? 'drop-shadow(0 0 6px rgba(167,139,250,0.55))' : 'none',
      }}
    >
      {currentUser.avatar ? (
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-full h-full rounded-full object-cover"
          style={{
            border: active
              ? '2px solid #a78bfa'
              : '2px solid rgba(255,255,255,0.2)',
          }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{
            background: active
              ? 'linear-gradient(135deg, #6c63ff, #a78bfa)'
              : 'rgba(255,255,255,0.12)',
            border: active
              ? '2px solid rgba(167,139,250,0.6)'
              : '2px solid rgba(255,255,255,0.15)',
          }}
        >
          {initial}
        </div>
      )}
      {/* Online dot */}
      <span
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
        style={{
          background: '#22c55e',
          borderColor: 'rgb(8,8,16)',
        }}
      />
    </div>
  )
}

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  function isActive(item: NavItem) {
    if (!item.href) return false
    if (item.href === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.href)
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(48px) saturate(220%) brightness(1.08)',
        WebkitBackdropFilter: 'blur(48px) saturate(220%) brightness(1.08)',
        borderTop: '1px solid rgba(255,255,255,0.18)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '28px 28px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: `
          0 -1px 0 rgba(255,255,255,0.25) inset,
          0 1px 0 rgba(255,255,255,0.06) inset,
          0 -8px 48px rgba(108,99,255,0.18),
          0 -2px 16px rgba(0,0,0,0.35)
        `,
      }}
    >
      {/* Inner top highlight */}
      <div
        className="absolute top-0 inset-x-0 h-[1.5px] rounded-t-[28px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.45) 35%, rgba(167,139,250,0.5) 50%, rgba(255,255,255,0.45) 65%, transparent 95%)',
        }}
      />
      {/* Subtle colour wash */}
      <div
        className="absolute inset-0 rounded-t-[28px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 120%, rgba(108,99,255,0.13) 0%, transparent 70%)',
        }}
      />

      <div className="flex items-center justify-around px-1 relative" style={{ height: '62px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => item.href && navigate(item.href)}
              className="relative flex flex-col items-center justify-center gap-[3px] flex-1 h-full"
              aria-label={item.label}
            >
              {/* Active pill */}
              {active && (
                <motion.span
                  layoutId="bottomNavActive"
                  className="absolute inset-x-1.5 top-2 bottom-1 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    boxShadow: `
                      0 1px 0 rgba(255,255,255,0.3) inset,
                      0 -1px 0 rgba(255,255,255,0.06) inset,
                      0 4px 16px rgba(108,99,255,0.25),
                      0 0 0 1px rgba(108,99,255,0.15)
                    `,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10">
                {item.id === 'account' ? (
                  <AccountTabIcon active={active} />
                ) : (
                  <Icon
                    className="transition-all duration-200"
                    style={{
                      width: '22px',
                      height: '22px',
                      color: active ? '#c4b5fd' : 'rgba(255,255,255,0.45)',
                      filter: active
                        ? 'drop-shadow(0 0 8px rgba(167,139,250,0.7))'
                        : 'none',
                      strokeWidth: active ? 2.2 : 1.8,
                      fill: item.id === 'shorts' && active ? '#c4b5fd' : 'transparent',
                    }}
                  />
                )}
                {/* Active dot */}
                {active && item.id !== 'account' && (
                  <motion.span
                    layoutId={`dot-${item.id}`}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{
                      background: '#c4b5fd',
                      boxShadow: '0 0 6px #a78bfa, 0 0 12px rgba(167,139,250,0.5)',
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className="relative z-10 font-medium transition-all duration-200"
                style={{
                  fontSize: '10px',
                  color: active ? '#c4b5fd' : 'rgba(255,255,255,0.38)',
                  letterSpacing: active ? '0.02em' : '0',
                  textShadow: active ? '0 0 12px rgba(167,139,250,0.6)' : 'none',
                }}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
