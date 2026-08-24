import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { Toaster } from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'

const isAndroid = Capacitor.getPlatform() === 'android'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {!isAndroid && <Header />}
      <main className={`flex-1${isAndroid ? ' pb-[76px]' : ''}`}>
        <Outlet />
      </main>
      {!isAndroid && <Footer />}
      {isAndroid && <BottomNav />}
      <Toaster
        position={isAndroid ? 'top-center' : 'bottom-right'}
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
