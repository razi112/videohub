-- VideoHub Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  channel_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  views INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Watch History table
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Channels table
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL UNIQUE,   -- YouTube UCxxxxxxx ID
  name TEXT NOT NULL,
  handle TEXT,                       -- @handle (without @)
  description TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  subscriber_count TEXT,
  video_count INTEGER DEFAULT 0,
  channel_url TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published channels" ON public.channels
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anon can read all channels" ON public.channels
  FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY "Anon can insert channels" ON public.channels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can update channels" ON public.channels
  FOR UPDATE USING (true);

CREATE POLICY "Anon can delete channels" ON public.channels
  FOR DELETE USING (true);

-- Collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection Videos (many-to-many)
CREATE TABLE IF NOT EXISTS public.collection_videos (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, video_id)
);

-- Row Level Security Policies

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Videos: anyone can read published videos; anon key can do everything (PIN-protected admin)
CREATE POLICY "Public read published videos" ON public.videos
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anon can read all videos" ON public.videos
  FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY "Anon can insert videos" ON public.videos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can update videos" ON public.videos
  FOR UPDATE USING (true);

CREATE POLICY "Anon can delete videos" ON public.videos
  FOR DELETE USING (true);

-- Categories: public read and write (anon)
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Anon manage categories" ON public.categories
  FOR ALL USING (true) WITH CHECK (true);

-- Favorites: users manage their own
CREATE POLICY "Users manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Watch history: users manage their own
CREATE POLICY "Users manage own history" ON public.watch_history
  FOR ALL USING (auth.uid() = user_id);

-- Seed default categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Education', 'education', 'Educational content'),
  ('Science', 'science', 'Science videos'),
  ('Technology', 'technology', 'Tech tutorials'),
  ('Islamic', 'islamic', 'Islamic content'),
  ('Mathematics', 'mathematics', 'Math lessons'),
  ('English', 'english', 'English lessons'),
  ('Tutorials', 'tutorials', 'How-to guides'),
  ('Announcements', 'announcements', 'Important updates')
ON CONFLICT (slug) DO NOTHING;
