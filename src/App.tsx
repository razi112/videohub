import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useStore } from './store/useStore'
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public Pages — lazy loaded
const HomePage = lazy(() => import('./pages/HomePage'))
const VideosPage = lazy(() => import('./pages/VideosPage'))
const VideoPlayerPage = lazy(() => import('./pages/VideoPlayerPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ChannelsPage = lazy(() => import('./pages/ChannelsPage'))
const ShortsPage = lazy(() => import('./pages/ShortsPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))

// Admin Pages — lazy loaded (separate chunk; only admins visit these)
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminVideosPage = lazy(() => import('./pages/admin/AdminVideosPage'))
const AddVideoPage = lazy(() => import('./pages/admin/AddVideoPage'))
const EditVideoPage = lazy(() => import('./pages/admin/EditVideoPage'))
const AdminDraftsPage = lazy(() => import('./pages/admin/AdminDraftsPage'))
const AdminFeaturedPage = lazy(() => import('./pages/admin/AdminFeaturedPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'))
const AdminHomepagePage = lazy(() => import('./pages/admin/AdminHomepagePage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminChannelsPage = lazy(() => import('./pages/admin/AdminChannelsPage'))
const AddChannelPage = lazy(() => import('./pages/admin/AddChannelPage'))

/** Minimal full-screen fallback shown while a lazy chunk loads */
function PageFallback() {
  return <div className="min-h-screen" />
}

export default function App() {
  const loadVideos = useStore(s => s.loadVideos)
  const loadCategories = useStore(s => s.loadCategories)
  const loadChannels = useStore(s => s.loadChannels)

  // Initial load — run once on mount
  useEffect(() => {
    loadCategories()
    loadChannels()
    loadVideos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/videos/:id" element={<VideoPlayerPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/channels" element={<ChannelsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/shorts" element={<ShortsPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>

          {/* Standalone pages (no header/footer) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="videos" element={<AdminVideosPage />} />
            <Route path="videos/add" element={<AddVideoPage />} />
            <Route path="videos/edit/:id" element={<EditVideoPage />} />
            <Route path="drafts" element={<AdminDraftsPage />} />
            <Route path="featured" element={<AdminFeaturedPage />} />
            <Route path="channels" element={<AdminChannelsPage />} />
            <Route path="channels/add" element={<AddChannelPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="homepage" element={<AdminHomepagePage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
