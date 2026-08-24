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
  loadChannels: () => Promise<void>
  addChannel: (channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>) => Promise<Channel>
  updateChannel: (id: string, updates: Partial<Channel>) => Promise<void>
  deleteChannel: (id: string) => Promise<void>

  // Categories
  setCategories: (cats: Category[]) => void
  addCategory: (cat: Omit<Category, 'id' | 'created_at'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // Data loading
  loadVideos: () => Promise<void>
  loadCategories: () => Promise<void>
  videosLoading: boolean
  videosError: string | null

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
      videosLoading: false,
      videosError: null,
      setVideos: (videos) => set({ videos }),

      loadVideos: async () => {
        const { isAdmin } = get()
        set({ videosLoading: true, videosError: null })

        let query = supabase
          .from('videos')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false })

        if (!isAdmin) {
          query = query.eq('status', 'published')
        }

        const { data, error } = await query
        if (error) {
          console.error('loadVideos error:', error.message, error.code)
          set({ videosLoading: false, videosError: error.message })
          return
        }
        set({ videos: data as Video[], videosLoading: false, videosError: null })
      },

      loadCategories: async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        if (error) {
          console.error('loadCategories error:', error.message, error.code)
          return
        }
        if (data) {
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
          ...(video.created_at ? { created_at: video.created_at } : {}),
        }

        const { data, error } = await supabase
          .from('videos')
          .upsert(payload, { onConflict: 'youtube_video_id', ignoreDuplicates: true })
          .select('*, category:categories(*)')
          .maybeSingle()

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

      // Channels (persisted in Supabase)
      channels: [],

      loadChannels: async () => {
        const { data, error } = await supabase
          .from('channels')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false })
        // Silently ignore if table doesn't exist yet
        if (!error && data) {
          set({ channels: data as Channel[] })
        }
      },

      addChannel: async (channel) => {
        const payload = {
          channel_id: channel.channel_id,
          name: channel.name,
          handle: channel.handle || null,
          description: channel.description || null,
          thumbnail_url: channel.thumbnail_url || null,
          banner_url: channel.banner_url || null,
          subscriber_count: channel.subscriber_count || null,
          video_count: channel.video_count ?? 0,
          channel_url: channel.channel_url,
          category_id: channel.category_id || null,
          tags: channel.tags ?? [],
          status: channel.status,
        }

        const { data, error } = await supabase
          .from('channels')
          .upsert(payload, { onConflict: 'channel_id' })
          .select('*, category:categories(*)')
          .single()

        if (error) {
          console.error('Error adding channel:', error)
          // Fall back to local-only if table doesn't exist (42P01) or RLS blocks it
          if (error.code === '42P01' || error.code === '42501' || error.message?.includes('channels')) {
            const localChannel: Channel = {
              id: `local_${Date.now()}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...channel,
            }
            set((s) => ({
              channels: [localChannel, ...s.channels.filter((c) => c.channel_id !== localChannel.channel_id)],
            }))
            return localChannel
          }
          throw error
        }
        const saved = data as Channel
        set((s) => ({
          channels: [saved, ...s.channels.filter((c) => c.channel_id !== saved.channel_id)],
        }))
        return saved
      },

      updateChannel: async (id, updates) => {
        const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (updates.name !== undefined) payload.name = updates.name
        if (updates.status !== undefined) payload.status = updates.status
        if (updates.category_id !== undefined) payload.category_id = updates.category_id || null
        if (updates.thumbnail_url !== undefined) payload.thumbnail_url = updates.thumbnail_url
        if (updates.video_count !== undefined) payload.video_count = updates.video_count
        if (updates.description !== undefined) payload.description = updates.description
        if (updates.tags !== undefined) payload.tags = updates.tags

        const { data, error } = await supabase
          .from('channels')
          .update(payload)
          .eq('id', id)
          .select('*, category:categories(*)')
          .single()

        if (error) { console.error('Error updating channel:', error); throw error }
        if (data) {
          set((s) => ({
            channels: s.channels.map((c) => (c.id === id ? (data as Channel) : c)),
          }))
        }
      },

      deleteChannel: async (id) => {
        const { error } = await supabase.from('channels').delete().eq('id', id)
        if (error) { console.error('Error deleting channel:', error); throw error }
        set((s) => ({ channels: s.channels.filter((c) => c.id !== id) }))
      },

      // Categories
      setCategories: (cats) => set({ categories: cats }),
      addCategory: async (cat) => {
        const payload = {
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
        }
        const { data, error } = await supabase
          .from('categories')
          .insert(payload)
          .select('*')
          .single()
        if (error) { console.error('Error adding category:', error); throw error }
        if (data) set((s) => ({ categories: [...s.categories, data as Category] }))
      },
      updateCategory: async (id, updates) => {
        const payload: Record<string, unknown> = {}
        if (updates.name !== undefined) payload.name = updates.name
        if (updates.slug !== undefined) payload.slug = updates.slug
        if (updates.description !== undefined) payload.description = updates.description || null
        const { data, error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single()
        if (error) { console.error('Error updating category:', error); throw error }
        if (data) set((s) => ({ categories: s.categories.map((c) => (c.id === id ? (data as Category) : c)) }))
      },
      deleteCategory: async (id) => {
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (error) { console.error('Error deleting category:', error); throw error }
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
      },

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
      version: 3, // bumped — channels moved from localStorage to Supabase
      // Only persist user-specific local data, NOT videos/categories (those come from Supabase)
      partialize: (s) => ({
        favorites: s.favorites,
        watchHistory: s.watchHistory,
        currentUser: s.currentUser,
        isAdmin: s.isAdmin,
        darkMode: s.darkMode,
      }),
    }
  )
)
