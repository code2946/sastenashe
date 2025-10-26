# Movie Details Page - Tabs Guide

## How the Tabs Work

When you click on a movie, you'll see the movie details page with **4 tabs** at the bottom:

### 1. **Where to Watch** Tab (Default)
- Shows streaming services where you can watch the movie
- Shows options like Netflix, Prime Video, Disney+, etc.
- Has "Stream", "Rent", and "Buy" sections
- **If no providers found**: Shows "No streaming options available for your region"

### 2. **Synopsis** Tab
- Shows the movie overview/plot summary
- Shows the director name
- Shows cast members with photos

### 3. **Trailers** Tab
- Shows YouTube trailers and videos
- Click the play button to watch on YouTube
- **If no trailers**: Shows "No trailers available"

### 4. **Similar** Tab
- Shows movies similar to the current one
- Click any movie to navigate to its details page

## Common Issues & Solutions

### Issue 1: "Where to Watch" shows nothing

**Why this happens:**
- TMDB API might not have streaming data for your region
- The movie might not be available on any streaming platforms yet
- Network delays (API takes 30+ seconds as shown in logs)

**What you'll see:**
```
No streaming options available for your region
```

**This is normal!** Not all movies have streaming data.

### Issue 2: "Trailers" shows nothing

**Why this happens:**
- The movie doesn't have any trailers uploaded to TMDB
- The movie is too old or too new
- Regional restrictions

**What you'll see:**
```
No trailers available
```

**This is normal!** Not all movies have trailers in the database.

### Issue 3: Tabs don't switch when clicked

**Possible causes:**
1. **JavaScript not loaded** - Refresh the page
2. **Page still loading** - Wait for the movie data to load completely
3. **Browser issue** - Try a different browser

**How to test:**
1. Open browser console (F12)
2. Click on a tab
3. Look for any errors in red
4. Share those errors if tabs still don't work

### Issue 4: "Synopsis" shows nothing

**This should always work** because every movie has an overview.

**If Synopsis is empty:**
1. Check if the page finished loading (no loading spinner)
2. Check browser console for errors (F12)
3. The TMDB API might have returned incomplete data

## How to Test if Tabs are Working

### Step 1: Go to a Movie
1. Go to http://localhost:3001/discover
2. Click on any popular movie (like a recent blockbuster)

### Step 2: Wait for Loading
- Wait for the movie details to fully load
- You should see:
  - Movie poster
  - Movie title
  - Rating, year, runtime
  - Action buttons (AI Review, Discuss, Watchlist, etc.)
  - **4 tabs below** (Where to Watch, Synopsis, Trailers, Similar)

### Step 3: Test Each Tab

**Click "Synopsis":**
- ✅ Should show movie description
- ✅ Should show director name
- ✅ Should show cast photos

**Click "Trailers":**
- ✅ Should show trailer thumbnails (if available)
- ❌ Might show "No trailers available" (this is OK)

**Click "Where to Watch":**
- ✅ Should show streaming services (if available)
- ❌ Might show "No streaming options available" (this is OK)

**Click "Similar":**
- ✅ Should show similar movies in a grid

## Understanding the Logs

In your server logs, you can see these requests:
```
[TMDB Proxy] Requesting path: /3/movie/1086910/videos
[TMDB Proxy] Requesting path: /3/movie/1086910/watch/providers
[TMDB Proxy] Requesting path: /3/movie/1086910/similar
```

These mean:
- ✅ The app IS fetching trailers (videos)
- ✅ The app IS fetching streaming providers (watch/providers)
- ✅ The app IS fetching similar movies

The requests are successful (200 status code), so data IS being loaded.

## Expected Behavior

### Popular Movies (like Sonic 3, Deadpool, etc.)
- ✅ Synopsis: Always works
- ✅ Trailers: Usually 2-4 trailers
- ⚠️ Where to Watch: Depends on your region and availability
- ✅ Similar: Always works

### Old Movies (like classics from the 80s-90s)
- ✅ Synopsis: Always works
- ❌ Trailers: Often no trailers available
- ⚠️ Where to Watch: Limited availability
- ✅ Similar: Always works

### Unreleased Movies (coming soon)
- ✅ Synopsis: Works
- ✅ Trailers: Usually has teaser/trailer
- ❌ Where to Watch: Not available yet
- ✅ Similar: Works

## Debugging Steps

If tabs seem broken:

### 1. Check if tabs are clickable
- Hover over each tab
- Does the cursor change?
- Does the tab highlight when you hover?

### 2. Check browser console
```
Press F12
Go to "Console" tab
Click on a movie tab
Look for errors (red text)
```

Common errors:
- `Cannot read property of undefined` - Data not loaded yet
- `Network error` - API request failed
- No errors but nothing happens - CSS or rendering issue

### 3. Check Network tab
```
Press F12
Go to "Network" tab
Reload the page
Look for these requests:
  - /3/movie/[id]/videos (trailers)
  - /3/movie/[id]/watch/providers (streaming)
  - /3/movie/[id]/similar (similar movies)
```

All should return 200 status (green).

### 4. Test with a known working movie
Try these movie IDs (paste in URL):
- http://localhost:3001/movies/507089 (Five Nights at Freddy's - has trailers)
- http://localhost:3001/movies/872585 (Oppenheimer - has everything)
- http://localhost:3001/movies/569094 (Spider-Man - has everything)

## What "Not Working" Might Mean

When you say tabs "don't work", it could mean:

1. **Tabs don't switch** → This is a bug, needs investigation
2. **No content shows** → This might be normal (no data available)
3. **Tabs are missing** → This is a bug, needs investigation
4. **Content is there but hidden** → This is a CSS bug

## Quick Checklist

Before reporting an issue:

- [ ] I can see the 4 tabs (Watch, Synopsis, Trailers, Similar)
- [ ] I clicked on each tab
- [ ] Synopsis tab shows movie description
- [ ] I checked browser console for errors (F12)
- [ ] I waited for the page to fully load
- [ ] I tried with a popular recent movie
- [ ] The movie details page loaded completely (no loading spinner)

## Still Not Working?

If you've checked everything above and tabs genuinely don't work:

1. Take a screenshot showing:
   - The movie details page
   - The tabs section
   - Browser console (F12) with any errors

2. Tell me specifically:
   - Can you SEE the tabs?
   - Can you CLICK the tabs?
   - What happens when you click?
   - Which tab are you trying to use?
   - Which movie are you viewing?

3. Check if it's a data issue:
   - Does Synopsis tab work? (This should ALWAYS work)
   - If Synopsis works but Trailers don't → That's normal, data not available
   - If NO tabs work → That's a bug with the tabs component
