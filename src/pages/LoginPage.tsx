import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Delete, ArrowLeft, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'
import type { User } from '../types'

const ADMIN: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@videohub.com',
  role: 'admin',
  created_at: new Date().toISOString(),
}

const ADMIN_PIN = '9961'

const KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const { setCurrentUser } = useStore()
  const navigate = useNavigate()

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key)
      else if (e.key === 'Backspace') handleKey('⌫')
      else if (e.key === 'Enter') handleKey('✓')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pin, status])

  const handleKey = (key: string) => {
    if (status === 'loading' || status === 'success') return
    if (key === '⌫') { setPin(p => p.slice(0, -1)); setStatus('idle'); return }
    if (key === '✓') { verify(pin); return }
    if (pin.length >= 4) return
    const next = pin + key
    setPin(next)
    if (next.length === 4) setTimeout(() => verify(next), 100)
  }

  const verify = async (value: string) => {
    if (value.length < 4) return
    setStatus('loading')
    await new Promise(r => setTimeout(r, 500))
    if (value === ADMIN_PIN) {
      setStatus('success')
      setCurrentUser(ADMIN)
      await new Promise(r => setTimeout(r, 600))
      navigate('/admin')
    } else {
      setStatus('error')
      setPin('')
      setTimeout(() => setStatus('idle'), 900)
      toast.error('Incorrect PIN')
    }
  }

  const dotColor = (i: number) => {
    if (status === 'error') return 'bg-red-500 border-red-500'
    if (status === 'success') return 'bg-green-500 border-green-500'
    if (pin.length > i) return 'bg-[#6c63ff] border-[#6c63ff]'
    if (pin.length === i) return 'bg-transparent border-[#a78bfa] scale-110'
    return 'bg-transparent border-[#2a2a3a]'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden px-4">

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#6c63ff]/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#a78bfa]/5 rounded-full blur-[120px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#6c63ff 1px, transparent 1px), linear-gradient(90deg, #6c63ff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-300 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </Link>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[360px]"
      >
        {/* Glow ring behind card */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#6c63ff]/30 via-transparent to-[#a78bfa]/20 blur-sm" />

        <div className="relative bg-[#0e0e16] border border-[#ffffff08] rounded-3xl p-8 shadow-2xl shadow-black/60 backdrop-blur-sm">

          {/* Header */}
          <div className="text-center mb-8">
            {/* Icon */}
            <motion.div
              animate={status === 'error' ? { rotate: [-8, 8, -6, 6, 0] } : status === 'success' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="relative inline-flex mb-5"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] rounded-2xl flex items-center justify-center shadow-xl shadow-[#6c63ff]/30">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0e0e16] rounded-full flex items-center justify-center">
                <Lock className="w-2.5 h-2.5 text-[#a78bfa]" />
              </span>
            </motion.div>

            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Access</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN to continue</p>
          </div>

          {/* PIN dots */}
          <motion.div
            animate={status === 'error' ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-4 mb-8"
          >
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ scale: pin.length === i && status === 'idle' ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${dotColor(i)}`}
              >
                <AnimatePresence mode="wait">
                  {pin.length > i && status !== 'error' && status !== 'success' && (
                    <motion.div
                      key="dot"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="w-3 h-3 rounded-full bg-white"
                    />
                  )}
                  {status === 'error' && (
                    <motion.span key="x" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-300 text-xs font-bold">✕</motion.span>
                  )}
                  {status === 'success' && (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-300 text-xs font-bold">✓</motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Status message */}
          <div className="h-5 text-center mb-5">
            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400"
                >
                  Incorrect PIN — try again
                </motion.p>
              )}
              {status === 'success' && (
                <motion.p
                  key="ok"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-green-400"
                >
                  Access granted — redirecting…
                </motion.p>
              )}
              {status === 'loading' && (
                <motion.p
                  key="load"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-500"
                >
                  Verifying…
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {KEYS.map((key) => {
              const isConfirm = key === '✓'
              const isDelete = key === '⌫'
              const isDisabled = status === 'loading' || status === 'success'

              return (
                <motion.button
                  key={key}
                  whileHover={!isDisabled ? { scale: 1.06, y: -1 } : {}}
                  whileTap={!isDisabled ? { scale: 0.92 } : {}}
                  onClick={() => handleKey(key)}
                  disabled={isDisabled}
                  className={`
                    h-14 rounded-2xl font-semibold flex items-center justify-center
                    select-none transition-all duration-150 border
                    ${isConfirm
                      ? 'bg-gradient-to-b from-[#6c63ff] to-[#5248e8] border-[#6c63ff]/80 text-white shadow-lg shadow-[#6c63ff]/20 hover:shadow-[#6c63ff]/40'
                      : isDelete
                      ? 'bg-[#161620] border-[#2a2a3a] text-gray-400 hover:text-white hover:border-[#3a3a4a]'
                      : 'bg-[#161620] border-[#222230] text-white hover:bg-[#1c1c2a] hover:border-[#6c63ff]/25 active:bg-[#6c63ff]/15'
                    }
                    disabled:opacity-30 disabled:cursor-not-allowed
                  `}
                >
                  {isDelete ? (
                    <Delete className="w-[18px] h-[18px]" />
                  ) : isConfirm ? (
                    status === 'loading' ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="text-lg">↵</span>
                    )
                  ) : (
                    <span className="text-[17px] tracking-wide">{key}</span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-[11px] text-gray-700 mt-5">
            You can also use your keyboard
          </p>
        </div>
      </motion.div>
    </div>
  )
}
