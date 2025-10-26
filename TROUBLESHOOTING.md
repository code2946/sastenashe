# Troubleshooting Guide - Buttons Not Working

## Issue: Add to Watchlist, Mark Seen, Like/Dislike Buttons Not Working

If the buttons aren't changing color or responding when clicked, follow this checklist:

## Step 1: Are You Signed In?

**THIS IS THE MOST COMMON ISSUE!**

All these features require authentication:
- ✅ Add to Watchlist
- ✅ Mark as Seen
- ✅ Like/Dislike

### How to Sign In:

1. Look at the top-right corner of the page
2. Do you see:
   - ❌ **"Sign In" button** - You're NOT logged in
   - ✅ **Your email and a logout icon** - You're logged in

3. If you see "Sign In":
   - Click the "Sign In" button
   - Create an account or sign in
   - Try the buttons again

## Step 2: Check Browser Console

Open the browser console to see errors:

**Windows/Linux**: Press `F12` or `Ctrl + Shift + J`
**Mac**: Press `Cmd + Option + J`

Look for errors like:
- ❌ `relation "movie_dislikes" does not exist` - Missing table
- ❌ `Auth session missing` - Not signed in
- ❌ `permission denied` - RLS policy issue

## Step 3: Run the Database Fix

The `movie_dislikes` table is likely missing. Run this SQL in Supabase:

1. Open: https://app.supabase.com/project/yunytyqnkaeuugpkpilu/sql
2. Click "New Query"
3. Copy and paste this:

```sql
-- Create movie_dislikes table
CREATE TABLE IF NOT EXISTS public.movie_dislikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL,
    liked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_movie_dislike UNIQUE(user_id, movie_id)
);

-- Enable RLS
ALTER TABLE public.movie_dislikes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own movie dislikes"
ON public.movie_dislikes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movie dislikes"
ON public.movie_dislikes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movie dislikes"
ON public.movie_dislikes FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.movie_dislikes TO authenticated;
GRANT ALL ON public.movie_dislikes TO service_role;
```

4. Click "Run"
5. Refresh your browser

## Step 4: Verify Database Tables

Run this command in your terminal:

```bash
node scripts/test-connection.js
```

You should see:
```
✅ Connection: SUCCESS
📋 Tables: 7/7 exist
```

If you see `6/7 exist`, you need to run the SQL script from Step 3.

## Step 5: Check Network Tab

1. Open browser DevTools (F12)
2. Go to the "Network" tab
3. Click a button (e.g., "Add to Watchlist")
4. Look for red/failed requests
5. Click on failed requests to see the error message

Common errors:
- **401 Unauthorized** - You're not signed in
- **404 Not Found** - Table doesn't exist
- **403 Forbidden** - RLS policy issue

## Quick Checklist

Before reporting an issue, verify:

- [ ] I am signed in (see my email in top-right corner)
- [ ] I ran the SQL script to create `movie_dislikes` table
- [ ] I ran `node scripts/test-connection.js` and all 7 tables exist
- [ ] I checked the browser console for errors
- [ ] I checked the Network tab for failed requests
- [ ] I refreshed the page after running the SQL script

## Expected Behavior

### When Signed In:
- ❤️ Heart icon turns **red** when added to watchlist
- 👁️ Eye icon shows **filled/highlighted** when marked as seen
- 👍 Thumbs up turns **yellow** when liked
- 👎 Thumbs down turns **gray/highlighted** when disliked

### When NOT Signed In:
- Clicking any button should open the **Sign In modal**
- No database operations will happen until you sign in

## Still Not Working?

If you've completed all steps and it's still not working:

1. **Check the terminal** where `npm run dev` is running
2. Look for database errors
3. Copy any error messages
4. Share them for further help

## Common Fixes Summary

| Problem | Solution |
|---------|----------|
| Buttons don't respond | Sign in first |
| Console shows "Auth session missing" | Sign in first |
| Console shows "relation does not exist" | Run SQL script in Step 3 |
| Console shows "permission denied" | Check RLS policies (included in SQL script) |
| Works for watchlist but not like/dislike | Missing `movie_dislikes` table - run SQL script |

## Test Script Output Reference

**Good Output:**
```
🎉 SUCCESS! All required tables are set up correctly.
📋 Tables: 7/7 exist
```

**Bad Output (Missing Table):**
```
❌ Table "movie_dislikes" does NOT exist
📋 Tables: 6/7 exist
```

If you see the bad output, run the SQL script from Step 3.
