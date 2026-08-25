import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store/useStore'
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public Pages
import HomePage from './pages/HomePage'
import VideosPage from './pages/VideosPage'
import VideoPlayerPage from './pages/VideoPlayerPage'
import CategoriesPage from './pages/CategoriesPage'
import FavoritesPage from './pages/FavoritesPage'
import LoginPage from './pages/LoginPage'
import ChannelsPage from './pages/ChannelsPage'
import ShortsPage from './pages/ShortsPage'
import AccountPage from './pages/AccountPage'

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview'
import AdminVideosPage from './pages/admin/AdminVideosPage'
import AddVideoPage from './pages/admin/AddVideoPage'
import EditVideoPage from './pages/admin/EditVideoPage'
import AdminDraftsPage from './pages/admin/AdminDraftsPage'
import AdminFeaturedPage from './pages/admin/AdminFeaturedPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminHomepagePage from './pages/admin/AdminHomepagePage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminChannelsPage from './pages/admin/AdminChannelsPage'
import AddChannelPage from './pages/admin/AddChannelPage'

export default function App() {
  const { loadVideos, loadCategories, loadChannels } = useStore()

  useEffect(() => {
    loadCategories()
    loadVideos()
    loadChannels()
  }, [])

  // Reload videos when admin status changes (login/logout)
  const isAdmin = useStore(s => s.isAdmin)
  useEffect(() => {
    loadVideos()
    loadChannels()
  }, [isAdmin])

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
