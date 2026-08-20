import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { Toaster } from 'react-hot-toast'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#16161e',
            color: '#f1f1f1',
            border: '1px solid #2a2a3a',
          },
        }}
      />
    </div>
  )
}
