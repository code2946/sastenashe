# ScreenOnFire - Vercel Deployment Guide

This guide will walk you through deploying ScreenOnFire to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Required API Keys**: See Environment Variables section below

## Quick Deploy

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project directory
cd final-main

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure your project (see settings below)
4. Add environment variables
5. Click "Deploy"

## Environment Variables

You **MUST** configure these environment variables in Vercel Dashboard:

### Required Variables

Go to: **Project Settings → Environment Variables**

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

**How to get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) → Your Project
2. Settings → API
3. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
6. Settings → API → JWT Settings → JWT Secret → `SUPABASE_JWT_SECRET`

#### TMDB API Configuration
```
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=your_tmdb_bearer_token
```

**How to get TMDB credentials:**
1. Sign up at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Copy `API Key (v3 auth)` → `TMDB_API_KEY`
4. Copy `API Read Access Token (v4 auth)` → `TMDB_ACCESS_TOKEN`

#### AI Integration (Google Gemini)
```
GEMINI_API_KEY=your_gemini_api_key
```

**How to get Gemini API key:**
1. Go to [ai.google.dev](https://ai.google.dev/)
2. Click "Get API Key"
3. Create new project or select existing
4. Copy API key → `GEMINI_API_KEY`

### Optional Variables

#### Database Direct Access (if needed)
```
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
DATABASE_URL=postgresql://...
```

These are usually not needed as Supabase client handles connections.

#### Production Environment
```
NODE_ENV=production
```

This is automatically set by Vercel.

## Project Settings in Vercel

### Build & Development Settings

- **Framework Preset**: Next.js
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Development Command**: `next dev` (default)

### Root Directory

If your project is in a subdirectory (like `final-main`), set:
- **Root Directory**: `final-main`

Otherwise leave as: `.` (project root)

### Node.js Version

Recommended: **18.x** or **20.x**

Set in `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Function Configuration

The ML recommendations endpoint needs extended timeout:
- Already configured in `vercel.json` with 60s max duration
- Free tier: 10s limit (upgrade to Pro for 60s)

## Database Setup (Supabase)

Before deploying, ensure your Supabase database is set up:

### 1. Create Tables

Run these SQL scripts in Supabase SQL Editor:

```bash
# Run in order:
1. scripts/create-watchlist-table.sql
2. scripts/create-discussions-schema.sql
3. scripts/create-threads-table.sql
4. scripts/create-movie-tables.sql
```

### 2. Enable Row Level Security (RLS)

Verify RLS is enabled for:
- `watchlist`
- `discussions`
- `discussion_reactions`
- `threads`
- `seen`
- `movie_likes`
- `movie_dislikes`

### 3. Test Database Connection

After deployment, test with:
```bash
curl https://your-app.vercel.app/api/discussions?movieId=550
```

## Post-Deployment Checklist

After your first deployment:

### 1. Verify Environment Variables
```bash
# Check if APIs are working
curl https://your-app.vercel.app/api/tmdb?path=/3/genre/movie/list
```

### 2. Test Key Features
- ✅ Movie search and discovery
- ✅ User authentication (sign up/login)
- ✅ Watchlist functionality
- ✅ AI recommendations
- ✅ Discussion forums
- ✅ AI movie reviews

### 3. Check Performance
- Run Lighthouse audit
- Verify loading times
- Test mobile responsiveness

### 4. Enable Analytics (Optional)
- Go to Vercel Dashboard → Analytics
- Enable Web Analytics
- Monitor performance metrics

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `screenonfire.com`)
3. Update DNS records as instructed
4. Wait for DNS propagation (5-10 minutes)

### Update Environment Variables

If using custom domain, update:
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

### Production Deployments
- Push to `main` branch → Production deployment
- Automatic builds on every commit
- Instant rollback available

### Preview Deployments
- Push to any other branch → Preview deployment
- Each PR gets unique preview URL
- Test changes before merging

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors during build
**Solution**: Errors are ignored in `next.config.mjs`, but fix them locally

**Issue**: Missing environment variables
**Solution**: Double-check all required vars are set in Vercel Dashboard

### API Timeout Errors

**Issue**: ML recommendations timing out
**Solution**: Upgrade to Vercel Pro for 60s function execution (Free tier: 10s)

### Database Connection Errors

**Issue**: Cannot connect to Supabase
**Solution**:
1. Verify Supabase URL and keys are correct
2. Check Supabase project is not paused
3. Ensure RLS policies allow access

### TMDB API Errors

**Issue**: Movies not loading
**Solution**:
1. Verify TMDB API key is valid
2. Check API rate limits (40 requests/10 seconds)
3. Review Network tab for failed requests

### Authentication Not Working

**Issue**: Users can't sign up/login
**Solution**:
1. Check Supabase Auth is enabled
2. Verify allowed domains in Supabase Auth settings
3. Add your Vercel domain to allowed URLs

## Performance Optimization

### Vercel Edge Network
- Automatic CDN distribution
- Global edge caching enabled
- Instant cache invalidation

### Recommended Vercel Settings

**Functions Region**:
- Set to closest region to your users
- Configured in `vercel.json` as `iad1` (US East)

**Image Optimization**:
- Enabled by default via Next.js Image
- TMDB images cached automatically

**Caching Headers**:
- Static assets: 1 year cache
- API routes: No cache (real-time data)

## Monitoring & Logs

### View Deployment Logs

```bash
# Via CLI
vercel logs your-deployment-url

# Via Dashboard
Project → Deployments → Select deployment → Runtime Logs
```

### Enable Error Tracking

Consider integrating:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and debugging
- **Vercel Analytics**: Performance monitoring

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Vercel's encrypted environment variables
- ✅ Rotate keys regularly

### API Security
- ✅ Validate all user inputs
- ✅ Implement rate limiting
- ✅ Use Supabase RLS policies
- ✅ Enable CORS only for your domain

### Headers
Security headers already configured in `next.config.mjs`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

## Support & Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **TMDB API Docs**: [developers.themoviedb.org](https://developers.themoviedb.org)

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Pull environment variables locally
vercel env pull .env.local

# Add environment variable
vercel env add VARIABLE_NAME

# Remove deployment
vercel rm deployment-url
```

## Estimated Costs

### Free Tier Limits
- 100 GB bandwidth/month
- 100 GB-hours serverless function execution
- 6,000 build minutes/month
- 10s max function duration

### If You Need More
- **Pro Plan**: $20/month per user
  - Unlimited bandwidth
  - 1,000 GB-hours function execution
  - 60s max function duration
  - Advanced analytics

## Success! 🎉

Your ScreenOnFire app should now be live at:
```
https://your-project.vercel.app
```

Share your deployment URL and enjoy your movie recommendation platform!

---

**Need Help?**
- Check [GitHub Issues](https://github.com/your-repo/issues)
- Contact support via Vercel Dashboard
- Review Vercel logs for errors
