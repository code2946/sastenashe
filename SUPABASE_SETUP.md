# Supabase Database Setup Guide

This guide will help you set up your Supabase database for the ScreenOnFire application.

## Problem

You're experiencing issues with:
- ❌ Unable to add movies to watchlist
- ❌ Unable to like movies
- ❌ Unable to mark movies as watched

This is because the required database tables haven't been created in your Supabase project yet.

## Solution: Run the Database Setup Script

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `yunytyqnkaeuugpkpilu`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Setup Script

1. Open the file: `scripts/00_complete_database_setup.sql`
2. Copy the **entire contents** of that file
3. Paste it into the SQL Editor in Supabase
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

The script will create these tables:
- ✅ `watchlist` - For saving movies to watch later
- ✅ `seen` - For tracking watched movies
- ✅ `movie_likes` - For liking/disliking movies
- ✅ `discussions` - For movie discussions
- ✅ `discussion_reactions` - For reacting to discussions
- ✅ `threads` - For discussion threads

### Step 3: Verify Setup

After running the script, you should see output showing:
- Tables created successfully
- RLS (Row Level Security) enabled
- Policies created

The script includes a verification query at the end that shows all tables and their RLS policies.

### Step 4: Restart Your Dev Server

After setting up the database:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Your Current Configuration

Your `.env` file is already correctly configured:

```env
NEXT_PUBLIC_SUPABASE_URL="https://yunytyqnkaeuugpkpilu.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
```

✅ Connection details are correct
✅ Environment variables are properly set
❌ Database tables need to be created (follow steps above)

## Testing After Setup

Once you've run the setup script, test these features:

1. **Watchlist**
   - Browse movies on `/discover`
   - Click the heart icon on any movie
   - Navigate to `/watchlist` to see your saved movies

2. **Movie Likes** (if implemented in UI)
   - Like/unlike movies
   - Your preferences will be saved

3. **Watched Movies** (if implemented in UI)
   - Mark movies as watched
   - Track your viewing history

## Troubleshooting

### "relation does not exist" errors

This means tables haven't been created yet. Run the setup script.

### "permission denied" errors

This means RLS policies aren't set up correctly. The setup script includes proper RLS policies.

### "duplicate key value" errors

This is normal - it means you're trying to add the same movie twice. Each user can only have one entry per movie in watchlist/likes/seen.

## Security Notes

✅ Row Level Security (RLS) is enabled on all tables
✅ Users can only access their own data
✅ Authentication is required for modifications
✅ Public read access only where appropriate (discussions)

## Direct Database Connection (Advanced)

If you need to connect directly to the database:

```
postgresql://postgres.yunytyqnkaeuugpkpilu:i97uFdzuIVf0nqMK@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

However, for this app, you should use the Supabase client library (already configured) rather than direct PostgreSQL connections.

## Need Help?

1. Check the Supabase dashboard for error messages
2. Look at the browser console for client-side errors
3. Check the terminal for server-side errors
4. Verify you're logged in (authentication required for watchlist/likes/seen)
