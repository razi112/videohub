-- ============================================================
-- Run this in your Supabase SQL Editor
-- Fixes RLS so the PIN-based admin can read/write all videos
-- and all users can see published videos
-- ============================================================

-- 1. Drop old restrictive policies on videos
DROP POLICY IF EXISTS "Public read published videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can insert videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can update videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON public.videos;
DROP POLICY IF EXISTS "Anon can read all videos" ON public.videos;
DROP POLICY IF EXISTS "Anon can insert videos" ON public.videos;
DROP POLICY IF EXISTS "Anon can update videos" ON public.videos;
DROP POLICY IF EXISTS "Anon can delete videos" ON public.videos;

-- 2. Drop old restrictive policies on categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anon manage categories" ON public.categories;

-- 3. Add channel_id column if it doesn't exist
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS channel_id TEXT;

-- 4. Add unique constraint on youtube_video_id if not exists
ALTER TABLE public.videos ADD CONSTRAINT IF NOT EXISTS videos_youtube_video_id_key UNIQUE (youtube_video_id);

-- 5. New video policies — anyone can read; anon key can write (PIN-protected admin)
CREATE POLICY "Anyone can read videos"
  ON public.videos FOR SELECT
  USING (true);

CREATE POLICY "Anon can insert videos"
  ON public.videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon can update videos"
  ON public.videos FOR UPDATE
  USING (true);

CREATE POLICY "Anon can delete videos"
  ON public.videos FOR DELETE
  USING (true);

-- 6. New category policies — anyone can read; anon can write
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Anon can manage categories"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. Create channels table (idempotent)
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  handle TEXT,
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

-- 8. Enable RLS and policies on channels
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published channels" ON public.channels;
DROP POLICY IF EXISTS "Anon can read all channels" ON public.channels;
DROP POLICY IF EXISTS "Anon can insert channels" ON public.channels;
DROP POLICY IF EXISTS "Anon can update channels" ON public.channels;
DROP POLICY IF EXISTS "Anon can delete channels" ON public.channels;

CREATE POLICY "Anyone can read channels"
  ON public.channels FOR SELECT
  USING (true);

CREATE POLICY "Anon can insert channels"
  ON public.channels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon can update channels"
  ON public.channels FOR UPDATE
  USING (true);

CREATE POLICY "Anon can delete channels"
  ON public.channels FOR DELETE
  USING (true);
