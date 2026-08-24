import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { Toaster } from 'react-hot-toast'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header — hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Main content — extra bottom padding on mobile so last card clears the bottom nav */}
      <main className="flex-1 pb-[80px] md:pb-0">
        <Outlet />
      </main>

      {/* Footer — hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Bottom nav — visible only on mobile (md:hidden is inside BottomNav itself) */}
      <BottomNav />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(20,20,32,0.85)',
            backdropFilter: 'blur(20px)',
            color: 'rgba(240,240,255,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}
