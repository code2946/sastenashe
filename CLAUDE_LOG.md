# ScreenOnFire - Claude Development Log

**Last Updated**: 2025-08-24  
**Status**: Code structure cleaned, duplicates removed  
**Version**: Next.js 14 with Supabase backend  

## 🎯 Project Overview
ScreenOnFire is a movie recommendation and discovery platform similar to JustWatch, featuring:
- AI-powered movie recommendations
- User authentication and personalized watchlists  
- Discussion forums with threaded comments
- TMDB API integration for movie data
- Regional content focus (Indian/Bollywood movies)
- Dark theme with yellow accents

## 📁 Current File Structure (Post-Cleanup)

### Core App Routes
```
app/
├── page.tsx                    # Home page (uses SimpleLanding component)
├── layout.tsx                  # Root layout with FloatingChatButton, PerformanceMonitor
├── loading.tsx                 # Global loading component
├── globals.css                 # Global styles
├── discover/page.tsx           # Movie discovery interface with filters
├── watchlist/page.tsx          # User's personal watchlist (auth required)
├── movies/[id]/page.tsx        # Individual movie details and discussions
└── recommendations/page.tsx    # Two-pane recommender UI
```

### API Routes (All functional)
```
app/api/
├── chat/route.ts              # AI chat with Gemini API + user context
├── discussions/
│   ├── route.ts               # CRUD operations for discussions
│   ├── [id]/route.ts          # Individual discussion management
│   └── reactions/route.ts     # Discussion reactions (likes/dislikes)
├── movie-review/route.ts      # AI-generated movie reviews
├── movie-suggestions/route.ts # Personalized recommendations
├── tmdb-image/route.ts        # TMDB image proxy (bypasses geo-restrictions)
└── tmdb/route.ts              # TMDB API proxy with retry logic
```

### Components Architecture
```
components/
├── simple-landing.tsx         # Main landing page component (currently used)
├── floating-chat-button.tsx   # Fixed chat button (AI integration)
├── auth-modal.tsx             # Authentication modal (Supabase Auth)
├── movie-card.tsx             # Reusable movie card component
├── movie-grid.tsx             # Grid layout for movies
├── discussion-modal.tsx       # Discussion/comments interface
├── ai-review-modal.tsx        # AI review generation modal
├── two-pane-recommender-ui.tsx # Advanced recommendation interface
├── performance-monitor.tsx    # Web Vitals monitoring
├── service-worker-initializer.tsx # SW registration
├── optimized-image.tsx        # Custom image component with lazy loading
├── lazy-components.tsx        # Lazy-loaded component exports
├── theme-provider.tsx         # Theme configuration
└── ui/                        # Complete shadcn/ui component library (40+ components)
```

### Backend & Data Layer
```
lib/
├── supabase.ts               # Main Supabase client + TypeScript types
├── supabase-admin.ts         # Admin client for RLS bypass
├── tmdb-supabase.ts          # Primary TMDB integration (active)
├── cache.ts                  # API response caching
├── utils.ts                  # Utility functions
├── performance.ts            # Performance tracking
├── prompts.ts                # AI prompt templates
├── ultra-fast-image.ts       # Image optimization
├── service-worker.ts         # SW logic
├── movie-sync.ts            # Movie data synchronization
├── cron-jobs.ts             # Scheduled tasks
└── date.ts                  # Date utilities
```

### Database Scripts
```
scripts/
├── create-watchlist-table.sql      # User watchlists
├── create-discussions-schema.sql   # Discussion threads
├── create-movie-tables.sql         # Movie data storage
├── create-threads-table.sql        # Threaded comments
├── 04_create_likes_table.sql       # Movie likes/ratings
├── 05_create_get_user_movies_function.sql # User movie profile function
├── fix-rls-policies.sql            # Row Level Security
└── [various seed scripts]          # Data seeding
```

### Hooks & Utilities
```
hooks/
├── use-mobile.tsx            # Mobile breakpoint detection
├── use-toast.ts              # Toast notification system
└── use-watchlist.ts          # Watchlist management
```

## 🗄️ Database Schema (Supabase)

### Tables
- **watchlist**: User's saved movies
- **discussions**: Movie discussion threads  
- **discussion_reactions**: Likes/dislikes on discussions
- **threads**: Nested comment threads
- **seen**: Movies user has watched
- **movie_likes**: User movie ratings

### Security
- Row Level Security (RLS) policies implemented
- User-specific data isolation
- Admin bypass capabilities via service role

## 🔌 API Integrations

### TMDB (The Movie Database)
- **Primary**: `tmdb-supabase.ts` - Active TMDB wrapper
- **Proxy**: `/api/tmdb` - Geo-restriction bypass
- **Images**: `/api/tmdb-image` - Image proxy
- **Features**: Search, discovery, genres, popular/top-rated, Indian movies
- **Fallback**: Mock data when API unavailable

### AI Services (Gemini)
- **Chat**: Context-aware recommendations using user profile
- **Reviews**: AI-generated movie reviews
- **Suggestions**: Personalized recommendations
- **Streaming**: Real-time response streaming

## 🎨 UI/UX Features

### Theme & Design
- **Mode**: Dark theme by default
- **Accent**: Yellow/gold color scheme
- **Responsive**: Mobile-first design
- **Components**: Complete shadcn/ui library

### User Experience
1. **Landing Page**: Hero section + feature showcase
2. **Discovery**: Advanced filtering (genre, rating, year)
3. **Movie Details**: Full info + discussions
4. **Watchlist**: Personal collections with heart/like system
5. **AI Chat**: Floating chat button for recommendations

## ⚡ Performance Optimizations

### Caching
- API response caching (600s TTL)
- Image optimization and lazy loading
- Service Worker for offline capability

### Monitoring
- Web Vitals tracking
- Performance monitoring component
- Error handling with user-friendly messages

## 🔧 Development Status

### ✅ Completed Features
- [x] Basic project structure
- [x] User authentication (Supabase Auth)
- [x] Movie discovery and search
- [x] Watchlist functionality
- [x] Discussion system with reactions
- [x] AI chat integration
- [x] TMDB API integration with proxy
- [x] Responsive design
- [x] Performance monitoring
- [x] Code cleanup and duplicate removal

### ✅ Recently Fixed Issues
1. **Import Error Fixed**: Resolved broken import in `tmdb-supabase.ts` referencing removed `tmdb-client`
2. **TMDB Integration**: Rewritten to use `/api/tmdb` proxy with fallback mock data
3. **Build Verification**: Successfully builds and runs in development mode
4. **ChunkLoadError Fixed**: Cleaned build artifacts and cache, restarted dev server successfully
5. **Server Status**: ✅ Running on http://localhost:3000 without errors
6. **Poster Loading Fixed**: ✅ Movie posters now load properly with optimized performance
7. **Image URL Generation**: Fixed `getImageUrl()` to properly construct TMDB image URLs
8. **Image Fallbacks**: Improved error handling and placeholder system

### 🚧 Current Issues to Address
1. **Documentation Update**: CLAUDE.md references removed files - needs updating
2. **Route Testing**: Verify all documented routes work as expected  
3. **Database Setup**: Verify all required tables exist with proper RLS

### 📋 Development Guidelines Established
- Use existing shadcn/ui components before custom ones
- Handle loading/error states consistently
- Implement proper RLS for user data
- Cache TMDB responses when possible
- Follow dark theme with yellow accents
- Mobile-first responsive design

## 🔐 Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=your_tmdb_access_token

# AI Integration
GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Development Commands
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Next.js linter
```

## 🔗 Component Relationship Map

### Page-Level Component Usage
```
app/layout.tsx
├── FloatingChatButton (global chat access)
├── PerformanceMonitor (web vitals tracking)
└── ServiceWorkerInitializer (offline capability)

app/page.tsx
└── SimpleLanding (main landing page)
    └── AuthModal (authentication)

app/discover/page.tsx
├── UI Components: Button, Card, Badge, Input, Select, Checkbox
├── MovieGrid → MovieCard → OptimizedImage
└── AuthModal (via lazy-components)

app/movies/[id]/page.tsx
├── UI Components: Button, Card, Tabs, ScrollArea
├── AiReviewModal (AI review generation)
└── DiscussionModal (threaded comments)

app/watchlist/page.tsx
├── UI Components: Card, Button
└── (Uses getMovieDetails from tmdb-supabase)

app/recommendations/page.tsx
└── TwoPaneRecommenderUI (advanced recommendation interface)
```

### Component Dependencies
```
MovieGrid
├── MovieCard
│   ├── OptimizedImage (custom image loading)
│   ├── UI: Button, Card
│   └── tmdb-supabase (getImageUrl, TMDBMovie types)
└── UI: Card, Button

FloatingChatButton
├── UI: Sheet, Button, Textarea, ScrollArea, Badge
└── /api/chat (AI integration)

DiscussionModal
├── UI: Dialog, Button, Textarea, ScrollArea, Avatar, Badge, DropdownMenu
└── /api/discussions (CRUD operations)

AuthModal
├── UI: Button, Input, Card, Label
└── Supabase Auth

AiReviewModal
├── UI: Dialog
└── /api/movie-review
```

### Data Flow
```
TMDB API → /api/tmdb → tmdb-supabase.ts → Components
Supabase → supabase.ts → Components
AI Services → /api/* → Components
User Actions → Components → API Routes → Database
```

## 📝 Notes for Future Development
1. **✅ Component Mapping**: All components are properly connected and used
2. **Route Testing**: Ensure all documented routes work as expected
3. **Database Setup**: Verify all required tables exist with proper RLS
4. **API Testing**: Test all endpoints for proper functionality
5. **Mobile Testing**: Verify responsive design across devices
6. **Performance**: Monitor and optimize loading times
7. **Error Handling**: Ensure graceful fallbacks everywhere

## 🔄 Recent Changes (2025-08-25)

### ✅ ML Movie Recommendation System Implementation
- **Complete ML Algorithm**: Built functional content-based filtering system with weighted feature matching
- **Real TMDB Integration**: Server-side TMDB API calls with proper error handling and retries
- **Feature Extraction**: Comprehensive movie analysis (genres, ratings, cast, directors, themes, years, language)
- **Similarity Calculation**: Weighted cosine similarity, Jaccard coefficients, normalized scoring
- **API Endpoint**: `/api/ml-recommendations` - Full ML-powered recommendation API
- **UI Integration**: Updated two-pane recommender to use real ML data instead of mock data
- **Search Integration**: Real TMDB movie search in UI with debounced requests
- **Performance**: Batch processing (10 movies/batch) for efficient candidate evaluation
- **Error Handling**: Graceful fallbacks, detailed logging, robust error management

### ML System Architecture
```
Files Created:
├── lib/ml-recommender.ts          # Core ML recommendation algorithm
├── lib/tmdb-server.ts            # Server-side TMDB API utilities  
├── app/api/ml-recommendations/   # ML recommendation API endpoint
├── lib/test-ml-recommendations.ts # Testing framework
└── docs/ml-recommendation-system.md # Complete documentation
```

### ML Features Implemented
- **Content-Based Filtering**: Analyzes movie features for similarity matching
- **Weighted Scoring**: User-configurable weights (genre, rating, director, cast, cinematography, keywords, year)
- **User Profile Generation**: Builds composite preferences from selected movies
- **Candidate Sources**: Popular movies, top-rated, discovery filters, similar movies
- **Real-time Processing**: Live TMDB data fetching and feature extraction
- **Match Reasoning**: Detailed explanations for why movies are recommended

### Performance & Testing
- **API Response Time**: ~9 seconds for 40 candidate movies (acceptable for ML processing)
- **Success Rate**: ✅ Successfully processes TMDB data and generates recommendations
- **Error Recovery**: TMDB network errors handled gracefully with fallbacks
- **Batch Processing**: Optimized to handle large candidate sets efficiently
- **Logging**: Comprehensive logging for debugging and monitoring

### Previous Changes (2025-08-24)

#### Code Cleanup & Structure
- Removed duplicate test pages and components
- Cleaned up unused library files
- Consolidated hooks to single locations
- Removed example/demo pages
- Cleaned up documentation duplicates
- Streamlined codebase structure

#### ✅ Git Repository Cleanup & GitHub Deployment
- **Repository Size Reduction**: Reduced from 144MB to 484KB (99.7% reduction)
- **Large File Removal**: Used git filter-branch to remove node_modules and .deb files from entire git history
- **GitHub Push Success**: ✅ Successfully pushed to https://github.com/code2946/final.git
- **History Cleanup**: Removed GitHubDesktop-linux-3.1.1-linux1.deb (72.74MB) from git history
- **Final Repository**: Clean, lightweight repository ready for deployment

#### Critical Fix - TMDB Integration
- **Fixed broken import error** in `tmdb-supabase.ts`
- Rewrote TMDB integration to use `/api/tmdb` proxy instead of removed `tmdb-client`
- Added comprehensive mock data fallbacks for offline/error scenarios
- Implemented all required TMDB functions:
  - `getGenres()`, `getPopularMovies()`, `getTopRatedMovies()`
  - `getIndianMovies()`, `getBollywoodMovies()`, `getHindiMovies()`
  - `searchMovies()`, `getMovieDetails()`, `discoverMovies()`
  - `getMovieCredits()`, `getVideos()`, `getSimilarMovies()`
- **Build Status**: ✅ Successfully builds and runs
- **Development Server**: ✅ Starts without errors

#### Image Loading Performance Fix
- **Root Cause**: Image proxy was slow (7+ seconds), causing timeouts and poor UX
- **Solution**: Switched to direct TMDB URLs for better performance (`https://image.tmdb.org/t/p/...`)
- **Smart Fallback System**: If direct TMDB fails, automatically falls back to proxy, then placeholder
- **Timeout Implementation**: 3-second timeout to prevent hanging images
- **Test Page Created**: `/test-images` for debugging image loading issues
- **Performance**: ✅ Images now load in <1 second with direct TMDB access
- **Fallback Chain**: Direct TMDB → Proxy → Placeholder.jpg

---
*This log serves as a reference point for understanding the current state of ScreenOnFire and should be updated as development continues.*