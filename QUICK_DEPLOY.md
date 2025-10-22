# Quick Deploy Guide - 5 Minutes to Production 🚀

This is the fastest way to get ScreenOnFire deployed on Vercel.

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Prepare Your API Keys (2 minutes)

Open these links in new tabs and get your API keys:

1. **Supabase** → [app.supabase.com](https://app.supabase.com)
   - Create new project or select existing
   - Go to Settings → API
   - Copy: Project URL, anon key, service_role key
   - Go to Settings → API → JWT Settings
   - Copy: JWT Secret

2. **TMDB** → [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - Copy: API Key (v3) and Access Token (v4)

3. **Google Gemini** → [ai.google.dev](https://ai.google.dev/)
   - Click "Get API Key"
   - Copy: API Key

Keep these values handy - you'll need them in Step 3.

### Step 2: Deploy to Vercel (1 minute)

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: Set to `final-main` if needed
5. Click **"Deploy"** (DON'T click it yet, do Step 3 first!)

**Option B: Via CLI**
```bash
npm install -g vercel
cd final-main
vercel login
vercel --prod
```

### Step 3: Add Environment Variables (2 minutes)

**IMPORTANT**: Do this BEFORE deploying or immediately after first deployment.

Go to: **Project Settings → Environment Variables**

Add these 7 variables (copy-paste the names exactly):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
TMDB_API_KEY
TMDB_ACCESS_TOKEN
GEMINI_API_KEY
```

For each variable:
1. Click "Add New"
2. Paste the key name (from above)
3. Paste your value (from Step 1)
4. Select: ✅ Production, ✅ Preview, ✅ Development
5. Click "Save"

### Step 4: Deploy (or Redeploy)

**If you already deployed without env vars:**
- Go to Deployments tab
- Click "Redeploy" on the latest deployment

**If you haven't deployed yet:**
- Click the "Deploy" button now

### Step 5: Verify Deployment (30 seconds)

Once deployed, test these URLs:

```bash
# Replace YOUR_DOMAIN with your Vercel URL

# Test API
https://YOUR_DOMAIN.vercel.app/api/tmdb?path=/3/genre/movie/list

# Test homepage
https://YOUR_DOMAIN.vercel.app/

# Test movie discovery
https://YOUR_DOMAIN.vercel.app/discover
```

## ✅ Success Checklist

- [ ] All 7 environment variables added
- [ ] Deployment succeeded (green checkmark)
- [ ] Homepage loads correctly
- [ ] Can search for movies
- [ ] Movie cards are clickable
- [ ] Movie details page loads

## 🎉 You're Live!

Your app is now deployed at:
```
https://your-project.vercel.app
```

## 🔧 Common Issues

### "Cannot connect to database"
**Fix**: Check Supabase environment variables are correct

### "TMDB API error"
**Fix**: Verify TMDB_API_KEY and TMDB_ACCESS_TOKEN

### "Build failed"
**Fix**: Check deployment logs in Vercel Dashboard → Deployments → View Function Logs

### Movies not loading
**Fix**:
1. Check TMDB API keys
2. Verify environment variables are in Production environment
3. Redeploy after adding env vars

## 📋 What's Next?

### Required: Set Up Database
Your app won't have user features until you set up Supabase tables.

**Run these in Supabase SQL Editor:**
1. `scripts/create-watchlist-table.sql`
2. `scripts/create-discussions-schema.sql`
3. `scripts/create-threads-table.sql`
4. `scripts/create-movie-tables.sql`

### Optional: Custom Domain
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS as instructed

### Optional: Upgrade Plan
Free tier limits:
- ⏱️ 10s function timeout (ML recommendations may timeout)
- 📊 100GB bandwidth/month

**Upgrade to Pro ($20/mo) for:**
- ⏱️ 60s function timeout
- 📊 Unlimited bandwidth
- 📈 Advanced analytics

## 🆘 Need Help?

- **Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Detailed Checklist**: [VERCEL_CHECKLIST.md](./VERCEL_CHECKLIST.md)
- **Documentation**: [README.md](./README.md)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

## 🎯 Pro Tips

1. **Environment Variables**: Always add to all 3 environments (Production, Preview, Development)
2. **Redeploy**: After adding env vars, always redeploy
3. **Logs**: Check runtime logs if something doesn't work
4. **Preview Deployments**: Every branch push gets a preview URL - test before merging!
5. **Database**: Set up Supabase tables for full functionality

---

**Total Time**: ~5 minutes ⚡

**You're ready to share your movie app with the world!** 🎬🔥
