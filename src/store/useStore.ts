import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Video, Category, User, Favorite, WatchHistory, Channel } from '../types'
import { supabase } from '../lib/supabase'

interface AppState {
  // Auth
  currentUser: User | null
  isAdmin: boolean
  setCurrentUser: (user: User | null) => void

  // Videos
  videos: Video[]
  categories: Category[]
  setVideos: (videos: Video[]) => void
  addVideo: (video: Omit<Video, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Video, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>
  deleteVideo: (id: string) => Promise<void>

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

  // Data loading
  loadVideos: () => Promise<void>
  loadCategories: () => Promise<void>

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

      // Videos
      videos: [],
      categories: [],
      setVideos: (videos) => set({ videos }),

      loadVideos: async () => {
        const { isAdmin } = get()
        let query = supabase
          .from('videos')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false })

        if (!isAdmin) {
          query = query.eq('status', 'published')
        }

        const { data, error } = await query
        if (!error && data) {
          set({ videos: data as Video[] })
        }
      },

      loadCategories: async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        if (!error && data) {
          set({ categories: data as Category[] })
        }
      },

      addVideo: async (video) => {
        const payload = {
          youtube_url: video.youtube_url,
          youtube_video_id: video.youtube_video_id,
          title: video.title,
          description: video.description || null,
          thumbnail_url: video.thumbnail_url || null,
          category_id: video.category_id || null,
          channel_id: video.channel_id || null,
          status: video.status,
          is_featured: video.is_featured,
          views: video.views ?? 0,
          tags: video.tags ?? [],
          duration: video.duration || null,
        }

        const { data, error } = await supabase
          .from('videos')
          .insert(payload)
          .select('*, category:categories(*)')
          .single()

        if (error) {
          console.error('Error adding video:', error)
          throw error
        }
        if (data) {
          set((s) => ({ videos: [data as Video, ...s.videos] }))
        }
      },

      updateVideo: async (id, updates) => {
        const payload: Record<string, unknown> = {}
        if (updates.title !== undefined) payload.title = updates.title
        if (updates.description !== undefined) payload.description = updates.description
        if (updates.thumbnail_url !== undefined) payload.thumbnail_url = updates.thumbnail_url
        if (updates.category_id !== undefined) payload.category_id = updates.category_id || null
        if (updates.status !== undefined) payload.status = updates.status
        if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured
        if (updates.tags !== undefined) payload.tags = updates.tags
        if (updates.duration !== undefined) payload.duration = updates.duration
        payload.updated_at = new Date().toISOString()

        const { data, error } = await supabase
          .from('videos')
          .update(payload)
          .eq('id', id)
          .select('*, category:categories(*)')
          .single()

        if (error) { console.error('Error updating video:', error); throw error }
        if (data) {
          set((s) => ({
            videos: s.videos.map((v) => (v.id === id ? (data as Video) : v)),
          }))
        }
      },

      deleteVideo: async (id) => {
        const { error } = await supabase.from('videos').delete().eq('id', id)
        if (error) { console.error('Error deleting video:', error); throw error }
        set((s) => ({ videos: s.videos.filter((v) => v.id !== id) }))
      },

      // Channels (local only — no DB table in schema)
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

      // Favorites (local per-user)
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

      // Watch History (local per-user)
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
      // Only persist user-specific local data, NOT videos/categories (those come from Supabase)
      partialize: (s) => ({
        favorites: s.favorites,
        watchHistory: s.watchHistory,
        currentUser: s.currentUser,
        isAdmin: s.isAdmin,
        darkMode: s.darkMode,
        channels: s.channels,
      }),
    }
  )
)
