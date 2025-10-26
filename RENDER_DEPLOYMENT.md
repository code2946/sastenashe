# Render Deployment Guide - ScreenOnFire

This guide will help you deploy ScreenOnFire to Render using GitHub Desktop.

## Pre-Deployment Checklist

### 1. Environment Variables Ready
All required environment variables are documented in `.env.example`. You'll need:

**Supabase Configuration:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `DATABASE_URL`

**API Keys:**
- `GEMINI_API_KEY` (Google Gemini AI)
- `TMDB_API_KEY` (The Movie Database)
- `TMDB_ACCESS_TOKEN`
- `NEXT_PUBLIC_TMDB_ACCESS_TOKEN`
- `OMDB_API_KEY` (Optional)
- `NEXT_PUBLIC_OMDB_API_KEY` (Optional)

### 2. Code is Ready for GitHub
- `.env` file is in `.gitignore` (✓ Verified)
- `.env.example` is updated with all variables (✓ Verified)
- No hardcoded secrets in code (✓ Verified)
- Build process works locally (✓ Verified)

## Step 1: Push to GitHub via GitHub Desktop

1. Open **GitHub Desktop**
2. Select this repository: `lookism`
3. Review the changes in the left panel
4. Write a commit message (e.g., "Prepare for Render deployment")
5. Click **Commit to main**
6. Click **Push origin** to push to GitHub

## Step 2: Create Render Account & Connect GitHub

1. Go to [render.com](https://render.com)
2. Sign up or log in
3. Click **"Connect GitHub"** to authorize Render to access your repositories

## Step 3: Create New Web Service on Render

1. Click **"New +"** button in Render dashboard
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Search for your repository (e.g., `lookism` or `screenonfire`)
   - Click **"Connect"**

## Step 4: Configure Web Service Settings

### Basic Settings:
- **Name:** `screenonfire` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** Leave blank (unless repo is in subdirectory)
- **Runtime:** `Node`

### Build & Deploy Settings:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Node Version:** Leave as default or specify `18` in `.node-version` file

### Instance Type:
- **Free tier** is fine for testing
- Upgrade to **Starter** ($7/month) for better performance

## Step 5: Add Environment Variables in Render

In the **Environment** section, add ALL variables from your `.env` file:

Click **"Add Environment Variable"** for each:

```
NEXT_PUBLIC_SUPABASE_URL = https://yunytyqnkaeuugpkpilu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET = dbfUFGVk5Tm9/8d1rQZ81Ax2h8dnfH1J...

POSTGRES_URL = postgres://postgres.yunytyqnkaeuugpkpilu...
POSTGRES_PRISMA_URL = postgres://postgres.yunytyqnkaeuugpkpilu...
POSTGRES_URL_NON_POOLING = postgres://postgres.yunytyqnkaeuugpkpilu...
DATABASE_URL = postgres://postgres.yunytyqnkaeuugpkpilu...

GEMINI_API_KEY = AIzaSyC5qsVSIoJKeashTiFFWF3-TvwQuHFRf1s
TMDB_API_KEY = 24dbef394f9034c03eb6c93a8f043c05
TMDB_ACCESS_TOKEN = eyJhbGciOiJIUzI1NiJ9...
NEXT_PUBLIC_TMDB_ACCESS_TOKEN = eyJhbGciOiJIUzI1NiJ9...

OMDB_API_KEY = ba767294
NEXT_PUBLIC_OMDB_API_KEY = ba767294
```

**Important:** Copy the actual values from your `.env` file!

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Run `npm run build`
   - Start the application with `npm start`
3. Wait for the build to complete (5-10 minutes first time)

## Step 7: Verify Deployment

1. Once deployed, Render will give you a URL like: `https://screenonfire.onrender.com`
2. Click the URL to open your deployed app
3. Test the following:
   - Homepage loads correctly
   - Movie discovery works (`/discover`)
   - Authentication works (sign up/login)
   - Watchlist functionality
   - AI chat features

## Step 8: Configure Supabase Allowed URLs

1. Go to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Render URL to allowed:
   - Site URL: `https://screenonfire.onrender.com`
   - Redirect URLs: `https://screenonfire.onrender.com/**`

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure Node version matches your local (18.x)

### App Crashes on Start
- Check the logs for error messages
- Verify database connection strings are correct
- Check if all required environment variables are set

### TMDB API Issues
- The app has fallback mock data if TMDB is blocked
- Check TMDB API key is valid
- Verify `TMDB_ACCESS_TOKEN` is set correctly

### Database Connection Issues
- Verify Supabase connection strings are correct
- Check if Supabase project is active
- Run database migration scripts if needed

## Automatic Deployments

Render automatically deploys when you push to GitHub:
1. Make changes locally
2. Commit in GitHub Desktop
3. Push to GitHub
4. Render automatically builds and deploys

## Monitoring & Logs

- **Logs:** Available in Render dashboard under "Logs" tab
- **Metrics:** View CPU, Memory usage in "Metrics" tab
- **Events:** See deployment history in "Events" tab

## Cost Considerations

**Free Tier:**
- Sleeps after 15 minutes of inactivity
- Cold start takes 30-60 seconds
- 750 hours/month free

**Starter Tier ($7/month):**
- Always on
- No cold starts
- Better performance

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificate (automatic with custom domain)
3. Set up monitoring and alerts
4. Consider upgrading to Starter tier for production

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Report issues in your repository

---

**Ready to Deploy?** Follow the steps above and your app will be live in minutes!
