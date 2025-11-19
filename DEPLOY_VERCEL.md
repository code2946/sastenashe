# 🚀 Deploy ScreenOnFire to Vercel

## Quick Deploy (1-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/code2946/sastenashe)

---

## Manual Deployment Steps

### 1. **Push to GitHub** ✅
Your code is already on GitHub: https://github.com/code2946/sastenashe

### 2. **Import to Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose your repository: `code2946/sastenashe`
5. Click **"Import"**

### 3. **Configure Environment Variables**

In the Vercel project settings, add these environment variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://yunytyqnkaeuugpkpilu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bnl0eXFua2FldXVncGtwaWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mjc0MTQsImV4cCI6MjA2ODUwMzQxNH0.jGwZGnNbgWoHHsEaie970Z_91NTeP-YHPeco30QnRHY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bnl0eXFua2FldXVncGtwaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkyNzQxNCwiZXhwIjoyMDY4NTAzNDE0fQ.hqxRM-jEO5bGCwPlyvHRHG4gWzDEHlKV75pF0mqoMoU

# AI - Gemini (Required)
GEMINI_API_KEY=AIzaSyC5qsVSIoJKeashTiFFWF3-TvwQuHFRf1s

# TMDB (Required)
TMDB_API_KEY=24dbef394f9034c03eb6c93a8f043c05
TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNGRiZWYzOTRmOTAzNGMwM2ViNmM5M2E4ZjA0M2MwNSIsIm5iZiI6MTc1MjkzMTUwOS44MzMsInN1YiI6IjY4N2I5Y2I1ZGZmMDA4MWRhYzcyYzI1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RmEVeq7ssiU0LSkUj9ihGMySUeS3y3CbeKs_00BCsi4
NEXT_PUBLIC_TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNGRiZWYzOTRmOTAzNGMwM2ViNmM5M2E4ZjA0M2MwNSIsIm5iZiI6MTc1MjkzMTUwOS44MzMsInN1YiI6IjY4N2I5Y2I1ZGZmMDA4MWRhYzcyYzI1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RmEVeq7ssiU0LSkUj9ihGMySUeS3y3CbeKs_00BCsi4
```

**How to add them:**
- Click **"Environment Variables"** in your Vercel project
- Add each variable one by one
- Set environment to: **Production**, **Preview**, and **Development**

### 4. **Deploy Settings**

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)
- **Node Version:** 18.x or higher

### 5. **Deploy!**

Click **"Deploy"** and wait 2-3 minutes.

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] Movie discovery works
- [ ] Search functionality works
- [ ] AI chat responds
- [ ] Watchlist feature works (requires login)
- [ ] Movie recommendations work

---

## 🔗 Your Live URLs

After deployment, you'll get:

- **Production:** `https://your-project.vercel.app`
- **Preview:** Auto-generated for each PR
- **Development:** Local development URL

---

## 🛠️ Troubleshooting

### Build Fails?

**Check:**
1. All environment variables are set
2. Supabase database is accessible
3. Build logs in Vercel dashboard

### API Routes Not Working?

**Verify:**
- Environment variables are set for Production
- Supabase RLS policies are configured
- CORS settings if using custom domain

### Images Not Loading?

**Add to Vercel Environment Variables:**
```
NEXT_PUBLIC_TMDB_ACCESS_TOKEN=your_token
```

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎉 That's It!

Your ScreenOnFire app should now be live on Vercel!

**Need help?** Check the Vercel build logs for detailed error messages.
