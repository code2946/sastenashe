# Vercel Deployment Checklist ✅

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

### 1. Code Preparation
- [x] All features tested locally
- [x] Performance optimizations completed (parallel data fetching, prefetching)
- [x] Mobile responsiveness verified
- [x] No console errors in production build
- [ ] Run `npm run build` locally to verify build succeeds

### 2. Environment Variables Ready
Prepare these values (you'll add them in Vercel Dashboard):

#### Supabase (Required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase API settings
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase API settings
- [ ] `SUPABASE_JWT_SECRET` - From Supabase JWT settings

#### TMDB API (Required)
- [ ] `TMDB_API_KEY` - From TMDB account settings
- [ ] `TMDB_ACCESS_TOKEN` - From TMDB API settings

#### AI Integration (Required)
- [ ] `GEMINI_API_KEY` - From Google AI Studio

#### Optional
- [ ] `NODE_ENV=production` (auto-set by Vercel)
- [ ] Database URLs (if using direct Postgres connections)

### 3. Supabase Database Setup
- [ ] All tables created (watchlist, discussions, threads, seen, movie_likes, movie_dislikes)
- [ ] Row Level Security (RLS) enabled and policies configured
- [ ] Test queries work from local environment
- [ ] Verify Supabase project is not paused

### 4. Repository Ready
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] `.env` file NOT committed (should be in .gitignore)
- [ ] README.md updated with project info
- [ ] All dependencies in package.json

## Deployment Steps

### 1. Create Vercel Project
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import your repository
- [ ] Select framework: Next.js (auto-detected)
- [ ] Set root directory (if needed): `final-main` or `.`

### 2. Configure Build Settings
- [ ] Build Command: `next build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Node.js Version: 18.x or 20.x

### 3. Add Environment Variables
- [ ] Go to Project Settings → Environment Variables
- [ ] Add ALL required variables listed above
- [ ] Select "Production" environment for each
- [ ] Verify no typos in variable names

### 4. Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Check deployment logs for errors

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigate to `/discover` - movies appear
- [ ] Navigate to `/recommendations` - AI recommendations work
- [ ] Search functionality works
- [ ] Movie details page loads when clicking a card

### 2. Authentication
- [ ] Sign up new account works
- [ ] Login with existing account works
- [ ] Logout works
- [ ] Password reset (if implemented)

### 3. User Features
- [ ] Add movie to watchlist
- [ ] Mark movie as seen
- [ ] Like/dislike movies
- [ ] View watchlist page
- [ ] Post discussion comment
- [ ] AI movie review generates

### 4. API Endpoints Test
```bash
# Replace YOUR_DOMAIN with your Vercel URL

# Test TMDB API
curl https://YOUR_DOMAIN.vercel.app/api/tmdb?path=/3/genre/movie/list

# Test discussions API
curl https://YOUR_DOMAIN.vercel.app/api/discussions?movieId=550

# Test ML recommendations (requires POST)
# Use Postman or your browser's fetch
```

### 5. Performance Check
- [ ] Run Lighthouse audit (aim for 90+ score)
- [ ] Check page load times (<3 seconds)
- [ ] Verify images load correctly
- [ ] Test on mobile device
- [ ] Check all pages in different browsers

### 6. Error Monitoring
- [ ] Check Vercel Runtime Logs for errors
- [ ] Test error scenarios (invalid movie ID, etc.)
- [ ] Verify 404 page works
- [ ] Check error boundaries catch errors

## Common Issues & Solutions

### Build Fails
**Problem**: Build fails with TypeScript errors
**Solution**: TypeScript errors are ignored in config, but check `next.config.mjs` settings

**Problem**: Missing dependencies
**Solution**: Run `npm install` locally, ensure package.json is up to date

### Runtime Errors
**Problem**: "Cannot connect to Supabase"
**Solution**: Verify environment variables are set correctly in Vercel

**Problem**: "TMDB API error"
**Solution**: Check TMDB API key is valid and not rate limited

**Problem**: "Timeout error on /api/ml-recommendations"
**Solution**: Upgrade to Vercel Pro for 60s function execution (Free tier: 10s)

### Database Issues
**Problem**: RLS policy errors
**Solution**: Review and update RLS policies in Supabase

**Problem**: "Table does not exist"
**Solution**: Run database migration scripts in Supabase SQL Editor

## Optimization Tips

### Performance
- [ ] Enable Vercel Analytics (Project Settings → Analytics)
- [ ] Configure caching headers (already in next.config.mjs)
- [ ] Use Vercel Image Optimization (already configured)
- [ ] Consider upgrading to Vercel Pro for better performance

### Security
- [ ] Review Supabase RLS policies
- [ ] Rotate API keys regularly
- [ ] Enable 2FA on Vercel account
- [ ] Set up custom domain with SSL (automatic with Vercel)

### Monitoring
- [ ] Set up Vercel notifications for failed deployments
- [ ] Configure error tracking (Sentry, LogRocket, etc.)
- [ ] Enable deployment protection for production
- [ ] Set up preview deployments for testing

## Continuous Deployment

### Automatic Deployments
- [x] Push to `main` branch → Production deployment
- [x] Push to other branches → Preview deployment
- [x] Pull requests get unique preview URLs

### Manual Deployments
```bash
# Via Vercel CLI
vercel --prod

# Rollback to previous deployment
# Go to Vercel Dashboard → Deployments → Select previous → Promote to Production
```

## Final Steps

### 1. Test Everything
- [ ] Complete all verification steps above
- [ ] Test on multiple devices
- [ ] Have friend/colleague test the app

### 2. Share Your App
- [ ] Copy production URL: `https://your-app.vercel.app`
- [ ] Share with users
- [ ] Update README with live URL

### 3. Monitor Performance
- [ ] Check Vercel Analytics dashboard
- [ ] Review error logs daily
- [ ] Monitor API usage and costs

## Success! 🎉

Your ScreenOnFire app is now live on Vercel!

**Production URL**: `https://_____________.vercel.app`

---

## Quick Reference

### Useful Commands
```bash
# View logs
vercel logs your-deployment-url

# Pull env variables locally
vercel env pull .env.local

# List deployments
vercel ls

# Deploy to production
vercel --prod
```

### Important Links
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- TMDB API Docs: https://developers.themoviedb.org
- Google AI Studio: https://ai.google.dev

### Support
- Vercel Docs: https://vercel.com/docs
- Deployment Guide: See `DEPLOYMENT.md`
- GitHub Issues: Create issue in your repo
