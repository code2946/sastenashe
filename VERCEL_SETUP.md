# Vercel Deployment Setup Guide

## Issue: Movies Not Loading on Vercel (Showing Mock Data Only)

Your app is showing mock data because the **TMDB_ACCESS_TOKEN** environment variable is not configured in Vercel.

---

## ✅ Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **lookism** (or whatever you named it)

### Step 2: Navigate to Environment Variables
1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar

### Step 3: Add Required Environment Variables

Add these **EXACT** variables (copy from your `.env` file):

#### 🎬 TMDB API (CRITICAL - Required for movies to load)
```
Name: TMDB_ACCESS_TOKEN
Value: eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNGRiZWYzOTRmOTAzNGMwM2ViNmM5M2E4ZjA0M2MwNSIsIm5iZiI6MTc1MjkzMTUwOS44MzMsInN1YiI6IjY4N2I5Y2I1ZGZmMDA4MWRhYzcyYzI1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RmEVeq7ssiU0LSkUj9ihGMySUeS3y3CbeKs_00BCsi4
Environment: Production, Preview, Development (select all 3)
```

```
Name: TMDB_API_KEY
Value: 24dbef394f9034c03eb6c93a8f043c05
Environment: Production, Preview, Development (select all 3)
```

#### 🗄️ Supabase (Required for user features)
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://yunytyqnkaeuugpkpilu.supabase.co
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bnl0eXFua2FldXVncGtwaWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mjc0MTQsImV4cCI6MjA2ODUwMzQxNH0.jGwZGnNbgWoHHsEaie970Z_91NTeP-YHPeco30QnRHY
Environment: Production, Preview, Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bnl0eXFua2FldXVncGtwaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkyNzQxNCwiZXhwIjoyMDY4NTAzNDE0fQ.hqxRM-jEO5bGCwPlyvHRHG4gWzDEHlKV75pF0mqoMoU
Environment: Production, Preview, Development
```

#### 🤖 Google Gemini AI (Required for AI chat features)
```
Name: GEMINI_API_KEY
Value: AIzaSyC5qsVSIoJKeashTiFFWF3-TvwQuHFRf1s
Environment: Production, Preview, Development
```

### Step 4: Redeploy Your Application
After adding all environment variables:

1. Go to **Deployments** tab
2. Click on the **three dots (...)** next to your latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~2-3 minutes)

---

## 🔍 Verify the Fix

### Method 1: Check Browser Developer Tools
1. Open your deployed site
2. Press **F12** to open Developer Tools
3. Go to **Network** tab
4. Refresh the page
5. Click on any request to `/api/tmdb`
6. Check the **Response Headers** - look for:
   - `X-Data-Source: tmdb-direct` ✅ (Good - real TMDB data)
   - `X-Data-Source: cors-proxy` ✅ (Good - real TMDB data via proxy)
   - `X-Data-Source: mock-data` ❌ (Bad - environment variables not set)

### Method 2: Check Vercel Logs
1. Go to your Vercel project dashboard
2. Click **Logs** tab
3. Look for messages like:
   - `[TMDB Proxy] Token available: true` ✅ Good
   - `[TMDB Proxy] Token available: false` ❌ Bad - env vars not set
   - `[TMDB Proxy] Success - Direct TMDB API` ✅ Best case
   - `[TMDB Proxy] ERROR: No valid TMDB_ACCESS_TOKEN` ❌ Fix needed

---

## 🚨 Common Issues

### Issue 1: Still Showing Mock Data After Redeploy
**Solution**:
- Make sure you selected **all 3 environments** (Production, Preview, Development) when adding variables
- Wait 5 minutes for cache to clear
- Do a hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Issue 2: Movies Load Slowly
**Solution**: This is normal on first load. The API uses caching:
- First request: ~2-3 seconds
- Subsequent requests: Instant (cached for 1 hour)

### Issue 3: "TMDB API unreachable in your region"
**Solution**:
- The app automatically uses CORS proxy for regions where TMDB is blocked
- This is normal and expected - movies should still load
- Look for `X-Data-Source: cors-proxy` in Network tab

---

## 📋 Quick Checklist

- [ ] Added `TMDB_ACCESS_TOKEN` to Vercel
- [ ] Added `TMDB_API_KEY` to Vercel
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Added `GEMINI_API_KEY` to Vercel
- [ ] Selected all 3 environments for each variable
- [ ] Redeployed the application
- [ ] Verified movies are loading (not mock data)

---

## 🎯 Expected Behavior After Fix

✅ **What you should see:**
- 20 movies load on initial page load
- "Load More Movies" button appears at bottom
- Clicking "Load More" adds 20 more movies
- Can load hundreds/thousands of movies by clicking repeatedly
- Movies have real posters, ratings, and details

❌ **What indicates it's still broken:**
- Only 5 movies showing (Venom, Gladiator II, The Wild Robot, The Substance, Moana 2)
- These same 5 movies repeat
- Response headers show `X-Data-Source: mock-data`

---

## 💡 Pro Tips

1. **Check the deployment URL** - Make sure you're testing the latest deployment
2. **Clear browser cache** - Old cached responses may persist
3. **Use Incognito mode** - Fresh browser session without cache
4. **Check Vercel logs** - They show exactly what's happening server-side

---

## Need Help?

If movies still don't load after following these steps:

1. Check Vercel logs for error messages
2. Verify all environment variables are exactly as shown above (no extra spaces)
3. Make sure your TMDB API key is still valid at [themoviedb.org](https://www.themoviedb.org/settings/api)
4. Check if the deployment actually redeployed after adding env vars

**The issue is 99% likely to be missing environment variables in Vercel!**
