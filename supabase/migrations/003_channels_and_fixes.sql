-- ============================================================
-- Migration: 003_channels_and_fixes
--
-- Safely sets up the channels table with correct RLS policies,
-- adds missing columns to videos, and resolves any duplicate
-- policy conflicts from previous manual SQL runs.
--
-- HOW TO APPLY
-- ─────────────
-- Supabase Dashboard → SQL Editor → paste this file → Run
-- ============================================================

-- ── 1. Add missing columns to videos (idempotent) ────────────
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_short BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_live  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS channel_id TEXT;

-- Unique constraint on youtube_video_id (safe if already exists)
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_youtube_video_id_key;
ALTER TABLE public.videos ADD CONSTRAINT videos_youtube_video_id_key UNIQUE (youtube_video_id);

-- ── 2. Videos RLS — drop all old policies and recreate ───────
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published videos"   ON public.videos;
DROP POLICY IF EXISTS "Anon can read all videos"       ON public.videos;
DROP POLICY IF EXISTS "Anon can insert videos"         ON public.videos;
DROP POLICY IF EXISTS "Anon can update videos"         ON public.videos;
DROP POLICY IF EXISTS "Anon can delete videos"         ON public.videos;
DROP POLICY IF EXISTS "Anyone can read videos"         ON public.videos;
DROP POLICY IF EXISTS "Admins can insert videos"       ON public.videos;
DROP POLICY IF EXISTS "Admins can update videos"       ON public.videos;
DROP POLICY IF EXISTS "Admins can delete videos"       ON public.videos;

CREATE POLICY "Anyone can read videos"
  ON public.videos FOR SELECT USING (true);

CREATE POLICY "Anon can insert videos"
  ON public.videos FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can update videos"
  ON public.videos FOR UPDATE USING (true);

CREATE POLICY "Anon can delete videos"
  ON public.videos FOR DELETE USING (true);

-- ── 3. Categories RLS — drop all old policies and recreate ───
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories"         ON public.categories;
DROP POLICY IF EXISTS "Anon manage categories"         ON public.categories;
DROP POLICY IF EXISTS "Anon can manage categories"     ON public.categories;
DROP POLICY IF EXISTS "Anyone can read categories"     ON public.categories;

CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Anon can manage categories"
  ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- ── 4. Channels table (idempotent) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.channels (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id       TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  handle           TEXT,
  description      TEXT,
  thumbnail_url    TEXT,
  banner_url       TEXT,
  subscriber_count TEXT,
  video_count      INTEGER DEFAULT 0,
  channel_url      TEXT NOT NULL,
  category_id      UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags             TEXT[] DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Channels RLS — drop all old policies and recreate ─────
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published channels" ON public.channels;
DROP POLICY IF EXISTS "Anon can read all channels"     ON public.channels;
DROP POLICY IF EXISTS "Anon can insert channels"       ON public.channels;
DROP POLICY IF EXISTS "Anon can update channels"       ON public.channels;
DROP POLICY IF EXISTS "Anon can delete channels"       ON public.channels;
DROP POLICY IF EXISTS "Anyone can read channels"       ON public.channels;

CREATE POLICY "Anyone can read channels"
  ON public.channels FOR SELECT USING (true);

CREATE POLICY "Anon can insert channels"
  ON public.channels FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can update channels"
  ON public.channels FOR UPDATE USING (true);

CREATE POLICY "Anon can delete channels"
  ON public.channels FOR DELETE USING (true);
