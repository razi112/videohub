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

-- 4. New video policies — anyone can read; anon key can write (PIN-protected admin)
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

-- 5. New category policies — anyone can read; anon can write
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Anon can manage categories"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);
