import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function PublicLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const isShorts = location.pathname === '/shorts'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Top bar — hidden on Shorts ── */}
      {!isShorts && (
        <div className="hidden md:block sticky top-0 z-50">
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(c => !c)}
          />
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1">

        {/* Sidebar — hidden on Shorts */}
        {!isShorts && (
          <div
            className="hidden md:block sticky self-start"
            style={{ top: 64, height: 'calc(100vh - 64px)' }}
          >
            <Sidebar collapsed={sidebarCollapsed} />
          </div>
        )}

        {/* Main content */}
        <main className={`flex-1 min-w-0 ${isShorts ? '' : 'pb-[80px] md:pb-0'}`}>
          <Outlet />
          {!isShorts && (
            <div className="hidden md:block">
              <Footer />
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile bottom nav — hidden on Shorts ── */}
      {!isShorts && <BottomNav />}

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
