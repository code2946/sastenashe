-- ========================================
-- COMPLETE DATABASE SETUP FOR SCREENONFIRE
-- ========================================
-- Run this script in your Supabase SQL Editor to set up all required tables
-- This script is idempotent - safe to run multiple times

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. WATCHLIST TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL,
    title TEXT NOT NULL,
    poster_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_movie UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own watchlist items" ON public.watchlist;
DROP POLICY IF EXISTS "Users can insert their own watchlist items" ON public.watchlist;
DROP POLICY IF EXISTS "Users can delete their own watchlist items" ON public.watchlist;

-- Create RLS policies so users can only access their own watchlist items
CREATE POLICY "Users can view their own watchlist items"
ON public.watchlist FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist items"
ON public.watchlist FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items"
ON public.watchlist FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON public.watchlist(created_at DESC);

-- Grant necessary permissions
GRANT ALL ON public.watchlist TO authenticated;
GRANT ALL ON public.watchlist TO service_role;


-- ========================================
-- 2. SEEN MOVIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.seen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_seen_movie UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.seen ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own seen movies" ON public.seen;
DROP POLICY IF EXISTS "Users can insert their own seen movies" ON public.seen;
DROP POLICY IF EXISTS "Users can delete their own seen movies" ON public.seen;

-- Create RLS policies for seen table
CREATE POLICY "Users can view their own seen movies"
ON public.seen FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seen movies"
ON public.seen FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seen movies"
ON public.seen FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seen_user_id ON public.seen(user_id);
CREATE INDEX IF NOT EXISTS idx_seen_created_at ON public.seen(created_at DESC);

-- Grant necessary permissions
GRANT ALL ON public.seen TO authenticated;
GRANT ALL ON public.seen TO service_role;


-- ========================================
-- 3. MOVIE LIKES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.movie_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL,
    liked BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_movie_like UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.movie_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own movie likes" ON public.movie_likes;
DROP POLICY IF EXISTS "Users can insert their own movie likes" ON public.movie_likes;
DROP POLICY IF EXISTS "Users can update their own movie likes" ON public.movie_likes;
DROP POLICY IF EXISTS "Users can delete their own movie likes" ON public.movie_likes;

-- Create RLS policies for movie_likes table
CREATE POLICY "Users can view their own movie likes"
ON public.movie_likes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movie likes"
ON public.movie_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movie likes"
ON public.movie_likes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movie likes"
ON public.movie_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movie_likes_user_id ON public.movie_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_likes_movie_id ON public.movie_likes(movie_id);

-- Grant necessary permissions
GRANT ALL ON public.movie_likes TO authenticated;
GRANT ALL ON public.movie_likes TO service_role;


-- ========================================
-- 4. MOVIE DISLIKES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.movie_dislikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL,
    liked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_movie_dislike UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.movie_dislikes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own movie dislikes" ON public.movie_dislikes;
DROP POLICY IF EXISTS "Users can insert their own movie dislikes" ON public.movie_dislikes;
DROP POLICY IF EXISTS "Users can update their own movie dislikes" ON public.movie_dislikes;
DROP POLICY IF EXISTS "Users can delete their own movie dislikes" ON public.movie_dislikes;

-- Create RLS policies for movie_dislikes table
CREATE POLICY "Users can view their own movie dislikes"
ON public.movie_dislikes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movie dislikes"
ON public.movie_dislikes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movie dislikes"
ON public.movie_dislikes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movie dislikes"
ON public.movie_dislikes FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movie_dislikes_user_id ON public.movie_dislikes(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_dislikes_movie_id ON public.movie_dislikes(movie_id);

-- Grant necessary permissions
GRANT ALL ON public.movie_dislikes TO authenticated;
GRANT ALL ON public.movie_dislikes TO service_role;


-- ========================================
-- 5. DISCUSSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view discussions" ON public.discussions;
DROP POLICY IF EXISTS "Authenticated users can insert discussions" ON public.discussions;
DROP POLICY IF EXISTS "Users can update their own discussions" ON public.discussions;
DROP POLICY IF EXISTS "Users can delete their own discussions" ON public.discussions;

-- Create RLS policies for discussions table
CREATE POLICY "Anyone can view discussions"
ON public.discussions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert discussions"
ON public.discussions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
ON public.discussions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
ON public.discussions FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussions_movie_id ON public.discussions(movie_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON public.discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_parent_id ON public.discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON public.discussions(created_at DESC);

-- Grant necessary permissions
GRANT ALL ON public.discussions TO authenticated;
GRANT ALL ON public.discussions TO service_role;


-- ========================================
-- 6. DISCUSSION REACTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.discussion_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike', 'love', 'laugh')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_discussion_reaction UNIQUE(user_id, discussion_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.discussion_reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.discussion_reactions;
DROP POLICY IF EXISTS "Authenticated users can insert reactions" ON public.discussion_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.discussion_reactions;

-- Create RLS policies for discussion_reactions table
CREATE POLICY "Anyone can view reactions"
ON public.discussion_reactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert reactions"
ON public.discussion_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.discussion_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussion_reactions_discussion_id ON public.discussion_reactions(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_reactions_user_id ON public.discussion_reactions(user_id);

-- Grant necessary permissions
GRANT ALL ON public.discussion_reactions TO authenticated;
GRANT ALL ON public.discussion_reactions TO service_role;


-- ========================================
-- 7. THREADS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view threads" ON public.threads;
DROP POLICY IF EXISTS "Authenticated users can insert threads" ON public.threads;
DROP POLICY IF EXISTS "Users can update their own threads" ON public.threads;
DROP POLICY IF EXISTS "Users can delete their own threads" ON public.threads;

-- Create RLS policies for threads table
CREATE POLICY "Anyone can view threads"
ON public.threads FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert threads"
ON public.threads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads"
ON public.threads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
ON public.threads FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_threads_movie_id ON public.threads(movie_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON public.threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_at ON public.threads(created_at DESC);

-- Grant necessary permissions
GRANT ALL ON public.threads TO authenticated;
GRANT ALL ON public.threads TO service_role;


-- ========================================
-- VERIFICATION
-- ========================================
-- This will show all the tables we just created
SELECT
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('watchlist', 'seen', 'movie_likes', 'movie_dislikes', 'discussions', 'discussion_reactions', 'threads')
ORDER BY tablename;

-- Show all RLS policies
SELECT
    tablename,
    policyname,
    cmd as command_type,
    permissive,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('watchlist', 'seen', 'movie_likes', 'movie_dislikes', 'discussions', 'discussion_reactions', 'threads')
ORDER BY tablename, policyname;
