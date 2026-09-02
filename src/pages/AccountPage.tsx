import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, LogOut, Heart, Settings,
  ChevronRight, Mail, Shield, Loader2, Eye, EyeOff, Lock, AtSign,
  History, Download, PlayCircle, CheckCircle2, Clock, Trash2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

/* ─── Shared liquid-glass style helpers ──────────────────────────────── */
const glass = {
  card: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.13)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.15) inset',
  } as React.CSSProperties,

  row: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.1) inset',
  } as React.CSSProperties,

  input: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)',
    WebkitTextFillColor: 'white',
  } as React.CSSProperties,

  inputFocus: {
    background: 'rgba(108,99,255,0.1)',
    border: '1px solid rgba(108,99,255,0.55)',
    boxShadow: '0 0 0 3px rgba(108,99,255,0.12)',
  } as React.CSSProperties,

  tabBar: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  } as React.CSSProperties,
} as const

/* ── Google "G" SVG logo ──────────────────────────────────── */
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

/* ── Reusable input field ─────────────────────────────────── */
function AuthInput({
  id, type, label, placeholder, value, onChange, icon: Icon, rightSlot,
}: {
  id: string
  type: string
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon: React.ElementType
  rightSlot?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-white/50 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
          style={glass.input}
          onFocus={(e) => Object.assign(e.currentTarget.style, glass.inputFocus)}
          onBlur={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
            e.currentTarget.style.boxShadow = ''
          }}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </div>
  )
}

/* ── Divider with label ───────────────────────────────────── */
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <span className="text-xs text-white/25 font-medium">or</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

/* ── Auth card with Sign In / Sign Up tabs ────────────────── */
function AuthCard() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useStore()

  type Tab = 'signin' | 'signup'
  const [tab, setTab] = useState<Tab>('signin')

  const [siEmail, setSiEmail]       = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siShowPw, setSiShowPw]     = useState(false)
  const [siLoading, setSiLoading]   = useState(false)

  const [suName, setSuName]         = useState('')
  const [suEmail, setSuEmail]       = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suShowPw, setSuShowPw]     = useState(false)
  const [suLoading, setSuLoading]   = useState(false)

  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignIn() {
    try {
      setGoogleLoading(true)
      await signInWithGoogle()
    } catch {
      setGoogleLoading(false)
      toast.error('Google sign-in failed. Please try again.')
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!siEmail || !siPassword) { toast.error('Please fill in all fields.'); return }
    try {
      setSiLoading(true)
      await signInWithEmail(siEmail, siPassword)
      toast.success('Signed in successfully!')
    } catch (err: unknown) {
      setSiLoading(false)
      toast.error(err instanceof Error ? err.message : 'Sign-in failed.')
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!suEmail || !suPassword) { toast.error('Please fill in all fields.'); return }
    if (suPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    try {
      setSuLoading(true)
      await signUpWithEmail(suEmail, suPassword, suName)
      toast.success('Account created! Check your email to confirm your address.')
      setSuLoading(false)
      setTab('signin')
    } catch (err: unknown) {
      setSuLoading(false)
      toast.error(err instanceof Error ? err.message : 'Sign-up failed.')
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'signin', label: 'Sign In' },
    { id: 'signup', label: 'Sign Up' },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-[200px] h-[200px] rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo + header */}
        <div className="flex flex-col items-center gap-4 mb-7">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
            style={{
              background: 'rgba(108,99,255,0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(108,99,255,0.4)',
              boxShadow: '0 8px 32px rgba(108,99,255,0.25), 0 1px 0 rgba(255,255,255,0.2) inset',
            }}
          >
            <User className="w-8 h-8 text-[#a78bfa]" />
            {/* Top shine */}
            <div
              className="absolute top-0 inset-x-2 h-px rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
            />
          </motion.div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {tab === 'signin' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-white/35 text-sm mt-1">
              {tab === 'signin'
                ? 'Sign in to access your saved videos and preferences.'
                : 'Join VideoHub to save videos and track your history.'}
            </p>
          </div>
        </div>

        {/* Glass card */}
        <div className="rounded-3xl overflow-hidden relative" style={glass.card}>
          {/* Top gleam line */}
          <div
            className="absolute top-0 inset-x-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.35) 50%, transparent 90%)' }}
          />
          {/* Inner colour wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(108,99,255,0.08) 0%, transparent 70%)' }}
          />

          {/* Tab bar */}
          <div className="flex relative" style={glass.tabBar} role="tablist" aria-label="Authentication options">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className="flex-1 py-3.5 text-sm font-semibold transition-colors relative"
                style={{ color: tab === id ? 'white' : 'rgba(255,255,255,0.35)' }}
              >
                {label}
                {tab === id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 inset-x-4 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #6c63ff, #a78bfa)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div className="p-5 relative z-10">
            <AnimatePresence mode="wait" initial={false}>
              {tab === 'signin' ? (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignIn}
                  className="flex flex-col gap-4"
                  aria-label="Sign in form"
                >
                  <AuthInput id="si-email" type="email" label="Email" placeholder="Enter Your Email"
                    value={siEmail} onChange={setSiEmail} icon={AtSign} />
                  <AuthInput id="si-password" type={siShowPw ? 'text' : 'password'} label="Password"
                    placeholder="Enter Your Password" value={siPassword} onChange={setSiPassword} icon={Lock}
                    rightSlot={
                      <button type="button" onClick={() => setSiShowPw(p => !p)}
                        aria-label={siShowPw ? 'Hide password' : 'Show password'}
                        className="text-white/30 hover:text-white/60 transition-colors">
                        {siShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={siLoading}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                    style={{
                      background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(108,99,255,0.4), 0 1px 0 rgba(255,255,255,0.2) inset',
                    }}>
                    {siLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {siLoading ? 'Signing in…' : 'Sign In'}
                  </motion.button>

                  <OrDivider />

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(8px)',
                      color: '#1a1a2e',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                    }}>
                    {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#6c63ff]" /> : <GoogleLogo size={18} />}
                    {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                  </motion.button>

                  <p className="text-center text-xs text-white/25 mt-1">
                    No account?{' '}
                    <button type="button" onClick={() => setTab('signup')}
                      className="text-[#a78bfa] hover:text-white transition-colors font-medium">
                      Sign up
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp}
                  className="flex flex-col gap-4"
                  aria-label="Sign up form"
                >
                  <AuthInput id="su-name" type="text" label="Display Name (optional)" placeholder="Your name"
                    value={suName} onChange={setSuName} icon={User} />
                  <AuthInput id="su-email" type="email" label="Email" placeholder="Enter Your Email"
                    value={suEmail} onChange={setSuEmail} icon={AtSign} />
                  <AuthInput id="su-password" type={suShowPw ? 'text' : 'password'} label="Password"
                    placeholder="Enter Your Password" value={suPassword} onChange={setSuPassword} icon={Lock}
                    rightSlot={
                      <button type="button" onClick={() => setSuShowPw(p => !p)}
                        aria-label={suShowPw ? 'Hide password' : 'Show password'}
                        className="text-white/30 hover:text-white/60 transition-colors">
                        {suShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={suLoading}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                    style={{
                      background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(108,99,255,0.4), 0 1px 0 rgba(255,255,255,0.2) inset',
                    }}>
                    {suLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {suLoading ? 'Creating account…' : 'Create Account'}
                  </motion.button>

                  <OrDivider />

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(8px)',
                      color: '#1a1a2e',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                    }}>
                    {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#6c63ff]" /> : <GoogleLogo size={18} />}
                    {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                  </motion.button>

                  <p className="text-center text-xs text-white/25 mt-1">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('signin')}
                      className="text-[#a78bfa] hover:text-white transition-colors font-medium">
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Kept for external use (compact Google-only prompt) ───── */
export function GoogleSignInPrompt({
  heading = 'Sign in to your account',
  subtext = 'Sign in with Google to access your saved videos, watch history, and preferences.',
  compact = false,
}: {
  heading?: string
  subtext?: string
  compact?: boolean
}) {
  const { signInWithGoogle } = useStore()
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    try {
      setLoading(true)
      await signInWithGoogle()
    } catch {
      setLoading(false)
      toast.error('Sign-in failed. Please try again.')
    }
  }

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 px-4">
        <p className="text-white/40 text-sm text-center">{subtext}</p>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleGoogleSignIn} disabled={loading}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full font-semibold text-sm transition-all disabled:opacity-60"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
          }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleLogo size={18} />}
          Continue with Google
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.14) 0%, transparent 70%)' }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(108,99,255,0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(108,99,255,0.4)',
            boxShadow: '0 8px 40px rgba(108,99,255,0.2), 0 1px 0 rgba(255,255,255,0.2) inset',
          }}
        >
          <User className="w-9 h-9 text-[#a78bfa]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">{heading}</h1>
          <p className="text-white/40 text-sm leading-relaxed">{subtext}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={handleGoogleSignIn} disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', color: '#1a1a2e', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#6c63ff]" /> : <GoogleLogo size={20} />}
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </motion.button>
      </motion.div>
    </div>
  )
}

/* ── Watch History Section ───────────────────────────────── */
function HistorySection() {
  const { watchHistory, videos } = useStore()
  const [expanded, setExpanded] = useState(false)

  const historyWithVideos = useMemo(() =>
    watchHistory
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map((h) => ({ ...h, video: videos.find((v) => v.id === h.video_id) }))
      .filter((h) => h.video),
    [watchHistory, videos]
  )

  const visible = expanded ? historyWithVideos : historyWithVideos.slice(0, 3)

  if (historyWithVideos.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-2 py-6 rounded-2xl"
        style={glass.row}
      >
        <Clock className="w-7 h-7 text-white/15" />
        <p className="text-xs text-white/25">No watch history yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((h) => {
        const pct = h.video!.duration
          ? Math.min(100, Math.round((h.progress_seconds / parseDuration(h.video!.duration)) * 100))
          : 0

        return (
          <Link key={h.id} to={`/videos/${h.video_id}?autoplay=1`} className="block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:brightness-110"
              style={glass.row}
            >
              <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                {h.video!.thumbnail_url ? (
                  <img src={h.video!.thumbnail_url} alt={h.video!.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-white/20" />
                  </div>
                )}
                {pct > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                    <div className="h-full rounded-full" style={{
                      width: `${pct}%`,
                      background: h.completed ? '#34d399' : 'linear-gradient(90deg, #6c63ff, #a78bfa)',
                    }} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 truncate">{h.video!.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {h.completed
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    : <Clock className="w-3 h-3 text-white/25 shrink-0" />}
                  <p className="text-[10px] text-white/25">
                    {h.completed ? 'Watched' : `${formatSeconds(h.progress_seconds)} watched`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
            </motion.div>
          </Link>
        )
      })}

      {historyWithVideos.length > 3 && (
        <button onClick={() => setExpanded(p => !p)}
          className="text-xs text-[#a78bfa] hover:text-white transition-colors text-center py-1">
          {expanded ? 'Show less' : `Show ${historyWithVideos.length - 3} more`}
        </button>
      )}
    </div>
  )
}

/* ── Downloads Section ───────────────────────────────────── */
function DownloadsSection() {
  const { downloads, videos, toggleDownload } = useStore()

  const savedVideos = useMemo(() =>
    downloads
      .slice()
      .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime())
      .map((d) => ({ ...d, video: videos.find((v) => v.id === d.video_id) }))
      .filter((d) => d.video),
    [downloads, videos]
  )

  if (savedVideos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 rounded-2xl" style={glass.row}>
        <Download className="w-7 h-7 text-white/15" />
        <p className="text-xs text-white/25">No downloads yet</p>
        <p className="text-[10px] text-white/15 text-center px-4">Tap Download on any video to save it here</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {savedVideos.map((d) => (
        <div key={d.id} className="flex items-center gap-2">
          <Link to={`/videos/${d.video_id}`} className="flex-1 min-w-0 block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:brightness-110"
              style={glass.row}
            >
              <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                {d.video!.thumbnail_url ? (
                  <img src={d.video!.thumbnail_url} alt={d.video!.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Download className="w-4 h-4 text-white/20" />
                  </div>
                )}
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.85)' }}>
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 truncate">{d.video!.title}</p>
                {d.video!.duration && <p className="text-[10px] text-white/25 mt-0.5">{d.video!.duration}</p>}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
            </motion.div>
          </Link>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleDownload(d.video_id)}
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-500/15"
            style={glass.row}
            aria-label="Remove download"
          >
            <Trash2 className="w-3.5 h-3.5 text-white/25 hover:text-red-400" />
          </motion.button>
        </div>
      ))}
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────── */
function parseDuration(dur: string): number {
  const parts = dur.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return Number(dur) || 1
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  if (m >= 60) { const h = Math.floor(m / 60); return `${h}h ${m % 60}m` }
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

/* ── Profile row ─────────────────────────────────────────── */
function ProfileRow({
  icon: Icon, label, value, href, onClick, danger = false,
}: {
  icon: React.ElementType
  label: string
  value?: string
  href?: string
  onClick?: () => void
  danger?: boolean
}) {
  const rowStyle: React.CSSProperties = danger
    ? {
        background: 'rgba(239,68,68,0.06)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '1px solid rgba(239,68,68,0.15)',
        boxShadow: '0 2px 12px rgba(239,68,68,0.08), 0 1px 0 rgba(255,255,255,0.06) inset',
      }
    : glass.row

  const inner = (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all hover:brightness-110"
      style={rowStyle}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(108,99,255,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(108,99,255,0.3)'}`,
          boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset',
        }}
      >
        <Icon className="w-4 h-4" style={{ color: danger ? '#f87171' : '#a78bfa' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white/80'}`}>{label}</p>
        {value && <p className="text-xs text-white/30 truncate mt-0.5">{value}</p>}
      </div>
      {!danger && <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />}
    </motion.div>
  )

  if (href) return <Link to={href} className="block">{inner}</Link>
  if (onClick) return <button onClick={onClick} className="block w-full text-left">{inner}</button>
  return inner
}

/* ── Main AccountPage ─────────────────────────────────────── */
export default function AccountPage() {
  const { currentUser, isAdmin, signOut, favorites, watchHistory, downloads } = useStore()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  if (!currentUser) {
    return (
      <div className="relative max-w-lg mx-auto">
        <AuthCard />
      </div>
    )
  }

  const initial = (currentUser.name?.[0] ?? currentUser.email?.[0] ?? 'U').toUpperCase()

  return (
    <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5"
        >
          {/* ── Avatar + name card ── */}
          <div className="relative rounded-3xl p-5 overflow-hidden" style={glass.card}>
            {/* Ambient glow top-right */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)' }} />
            {/* Top gleam */}
            <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.35) 50%, transparent 90%)' }} />
            {/* Colour wash */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(108,99,255,0.07) 0%, transparent 70%)' }} />

            <div className="flex items-center gap-4 relative z-10">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  style={{ border: '2px solid rgba(108,99,255,0.45)', boxShadow: '0 4px 16px rgba(108,99,255,0.25)' }} />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                    boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
                  }}
                >
                  {initial}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-white tracking-tight truncate">{currentUser.name}</h1>
                <p className="text-white/40 text-sm truncate mt-0.5">{currentUser.email}</p>
                <span
                  className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(108,99,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.3)' : 'rgba(108,99,255,0.3)'}`,
                    color: isAdmin ? '#fbbf24' : '#a78bfa',
                  }}
                >
                  {isAdmin ? <Shield className="w-2.5 h-2.5" /> : <GoogleLogo size={10} />}
                  {isAdmin ? 'Admin · Verified' : 'Google Account'}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 relative z-10"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { value: favorites.length, label: 'Saved' },
                { value: watchHistory.length, label: 'Watched' },
                { value: downloads.length, label: 'Downloads' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-white/30 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── My Content ── */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-white/25 uppercase tracking-widest px-1 mb-1">My Content</p>
            <ProfileRow icon={Heart} label="Saved Videos"
              value={`${favorites.length} video${favorites.length !== 1 ? 's' : ''} saved`} href="/favorites" />
          </div>

          {/* ── History ── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest flex items-center gap-1.5">
                <History className="w-3 h-3" /> History
              </p>
              {watchHistory.length > 0 && (
                <button
                  onClick={() => { useStore.setState({ watchHistory: [] }); toast.success('Watch history cleared') }}
                  className="flex items-center gap-1 text-[10px] text-white/25 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <HistorySection />
          </div>

          {/* ── Downloads ── */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-white/25 uppercase tracking-widest px-1 mb-1 flex items-center gap-1.5">
              <Download className="w-3 h-3" /> Downloads
            </p>
            <DownloadsSection />
          </div>

          {/* ── Account info ── */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-white/25 uppercase tracking-widest px-1 mb-1">Account Info</p>
            <ProfileRow icon={Mail} label="Email" value={currentUser.email} />
          </div>

          {/* ── Admin shortcut ── */}
          {isAdmin && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest px-1 mb-1">Administration</p>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.8), rgba(167,139,250,0.8))',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(167,139,250,0.35)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(108,99,255,0.35), 0 1px 0 rgba(255,255,255,0.2) inset',
                }}
              >
                <Settings className="w-4 h-4" />
                Login to Admin
              </motion.button>
            </div>
          )}

          {/* ── Account actions ── */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-white/25 uppercase tracking-widest px-1 mb-1">Account</p>
            {!isAdmin && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={glass.row}>
                <GoogleLogo size={16} />
                <p className="text-xs text-white/30 flex-1">Signed in with Google</p>
              </div>
            )}
            <ProfileRow icon={LogOut} label="Sign Out" onClick={handleSignOut} danger />
          </div>

          {/* ── Footer ── */}
          <p className="text-center text-xs text-white/15 pb-2">VideoHub · Your video library</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
