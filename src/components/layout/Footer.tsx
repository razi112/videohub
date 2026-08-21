import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Video, Tag, Heart, ShieldCheck } from 'lucide-react'

const links = [
  { label: 'Home',       href: '/',           icon: Home },
  { label: 'Videos',     href: '/videos',      icon: Video },
  { label: 'Categories', href: '/categories',  icon: Tag },
  { label: 'Favorites',  href: '/favorites',   icon: Heart },
]

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6c63ff]/40 to-transparent" />
      {/* Ambient blob */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#6c63ff]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative glass border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

          {/* Main grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mb-12">

            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa]" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                  <span className="relative z-10 flex items-center justify-center w-full h-full text-white font-bold">V</span>
                </div>
                <span className="text-white font-semibold text-xl tracking-tight">
                  Video<span className="text-[#a78bfa]">Hub</span>
                </span>
              </Link>
              <p className="text-sm text-white/35 leading-relaxed max-w-[260px]">
                Admin-curated YouTube videos. Discover, watch, and learn something new every day.
              </p>
              {/* YouTube badge */}
              <div className="inline-flex items-center gap-2 mt-5 px-3 py-1.5 glass rounded-full">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-red-500 shrink-0" aria-hidden="true">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
                </svg>
                <span className="text-xs text-white/40">Powered by YouTube</span>
              </div>
            </div>

            {/* Browse links */}
            <div>
              <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-5">Browse</p>
              <ul className="space-y-3">
                {links.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                      <Link to={href} className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white/80 transition-colors group">
                        <div className="w-6 h-6 glass rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                          <Icon className="w-3 h-3 text-white/40 group-hover:text-[#a78bfa] transition-colors" />
                        </div>
                        {label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin */}
            <div>
              <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-5">Admin</p>
              <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                <Link to="/login" className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white/80 transition-colors group">
                  <div className="w-6 h-6 glass rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                    <ShieldCheck className="w-3 h-3 text-white/40 group-hover:text-[#6c63ff] transition-colors" />
                  </div>
                  Admin Panel
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/25">
              © {new Date().getFullYear()} VideoHub · All rights reserved
            </p>
            <div className="flex items-center gap-2 text-xs text-white/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
              All systems operational
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
