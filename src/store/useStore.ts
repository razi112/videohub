import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Video, Category, User, Favorite, WatchHistory, Channel } from '../types'
import { mockVideos, mockCategories } from '../lib/mockData'

interface AppState {
  // Auth
  currentUser: User | null
  isAdmin: boolean
  setCurrentUser: (user: User | null) => void

  // Videos
  videos: Video[]
  categories: Category[]
  setVideos: (videos: Video[]) => void
  addVideo: (video: Video) => void
  updateVideo: (id: string, updates: Partial<Video>) => void
  deleteVideo: (id: string) => void

  // Channels
  channels: Channel[]
  addChannel: (channel: Channel) => void
  updateChannel: (id: string, updates: Partial<Channel>) => void
  deleteChannel: (id: string) => void

  // Categories
  setCategories: (cats: Category[]) => void
  addCategory: (cat: Category) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void

  // Favorites
  favorites: Favorite[]
  toggleFavorite: (videoId: string) => void
  isFavorite: (videoId: string) => boolean

  // Watch History
  watchHistory: WatchHistory[]
  updateWatchProgress: (videoId: string, progress: number, completed?: boolean) => void
  getVideoProgress: (videoId: string) => WatchHistory | undefined

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  darkMode: boolean
  toggleDarkMode: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      isAdmin: false,
      setCurrentUser: (user) => set({ currentUser: user, isAdmin: user?.role === 'admin' }),

      // Videos — seeded with mock data
      videos: mockVideos,
      categories: mockCategories,
      setVideos: (videos) => set({ videos }),
      addVideo: (video) => set((s) => ({ videos: [video, ...s.videos] })),
      updateVideo: (id, updates) =>
        set((s) => ({
          videos: s.videos.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        })),
      deleteVideo: (id) => set((s) => ({ videos: s.videos.filter((v) => v.id !== id) })),

      // Channels
      channels: [],
      addChannel: (channel) => set((s) => ({ channels: [channel, ...s.channels] })),
      updateChannel: (id, updates) =>
        set((s) => ({
          channels: s.channels.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteChannel: (id) => set((s) => ({ channels: s.channels.filter((c) => c.id !== id) })),

      // Categories
      setCategories: (cats) => set({ categories: cats }),
      addCategory: (cat) => set((s) => ({ categories: [...s.categories, cat] })),
      updateCategory: (id, updates) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      // Favorites
      favorites: [],
      toggleFavorite: (videoId) => {
        const { favorites, currentUser } = get()
        if (!currentUser) return
        const exists = favorites.find((f) => f.video_id === videoId)
        if (exists) {
          set({ favorites: favorites.filter((f) => f.video_id !== videoId) })
        } else {
          set({
            favorites: [
              ...favorites,
              {
                id: Date.now().toString(),
                user_id: currentUser.id,
                video_id: videoId,
                created_at: new Date().toISOString(),
              },
            ],
          })
        }
      },
      isFavorite: (videoId) => get().favorites.some((f) => f.video_id === videoId),

      // Watch History
      watchHistory: [],
      updateWatchProgress: (videoId, progress, completed = false) => {
        const { watchHistory, currentUser } = get()
        if (!currentUser) return
        const existing = watchHistory.find((h) => h.video_id === videoId)
        if (existing) {
          set({
            watchHistory: watchHistory.map((h) =>
              h.video_id === videoId
                ? { ...h, progress_seconds: progress, completed, updated_at: new Date().toISOString() }
                : h
            ),
          })
        } else {
          set({
            watchHistory: [
              ...watchHistory,
              {
                id: Date.now().toString(),
                user_id: currentUser.id,
                video_id: videoId,
                progress_seconds: progress,
                completed,
                updated_at: new Date().toISOString(),
              },
            ],
          })
        }
      },
      getVideoProgress: (videoId) => get().watchHistory.find((h) => h.video_id === videoId),

      // Search / Filter
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      selectedCategory: '',
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),

      // UI
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    {
      name: 'videohub-storage',
      partialize: (s) => ({
        favorites: s.favorites,
        watchHistory: s.watchHistory,
        currentUser: s.currentUser,
        isAdmin: s.isAdmin,
        darkMode: s.darkMode,
        videos: s.videos,
        categories: s.categories,
        channels: s.channels,
      }),
    }
  )
)
