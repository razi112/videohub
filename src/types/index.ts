export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
}

export interface Video {
  id: string
  youtube_url: string
  youtube_video_id: string
  title: string
  description?: string
  thumbnail_url?: string
  category_id?: string
  category?: Category
  channel_id?: string          // YouTube channel ID (UCxxxxx) if imported from channel
  status: 'published' | 'draft'
  is_featured: boolean
  is_live?: boolean            // if true, shows a LIVE badge on the video card
  is_short: boolean            // if true, video appears only in the Shorts feed
  views: number
  tags?: string[]
  duration?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  video_id: string
  video?: Video
  created_at: string
}

export interface WatchHistory {
  id: string
  user_id: string
  video_id: string
  video?: Video
  progress_seconds: number
  completed: boolean
  updated_at: string
}

export interface Download {
  id: string
  user_id: string
  video_id: string
  video?: Video
  saved_at: string
}

export interface Collection {
  id: string
  title: string
  description?: string
  thumbnail?: string
  created_at: string
  videos?: Video[]
}

export interface HomepageSection {
  id: string
  type: 'hero' | 'latest' | 'popular' | 'categories' | 'featured'
  enabled: boolean
  position: number
}

export interface Analytics {
  total_videos: number
  published_videos: number
  draft_videos: number
  total_users: number
  total_favorites: number
  popular_videos: Video[]
  recently_added: Video[]
  category_stats: { name: string; count: number }[]
}

export interface Channel {
  id: string
  channel_id: string          // YouTube UCxxxxxxx ID
  name: string
  handle?: string             // @handle
  description?: string
  thumbnail_url?: string
  banner_url?: string
  subscriber_count?: string
  video_count?: number
  channel_url: string
  category_id?: string
  category?: Category
  tags?: string[]
  status: 'published' | 'draft'
  created_at: string
  updated_at: string
}
