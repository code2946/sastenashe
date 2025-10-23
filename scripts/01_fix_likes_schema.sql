-- ========================================
-- FIX LIKES/DISLIKES SCHEMA
-- ========================================
-- The application code expects separate tables for likes and dislikes
-- This script creates the missing movie_dislikes table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CREATE MOVIE_DISLIKES TABLE
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
-- VERIFICATION
-- ========================================
SELECT 'movie_dislikes table created successfully' AS status;

SELECT
    tablename,
    policyname,
    cmd as command_type
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'movie_dislikes'
ORDER BY policyname;
