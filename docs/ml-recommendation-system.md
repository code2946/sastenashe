# ML Movie Recommendation System

## Overview

The ScreenOnFire ML recommendation system uses **content-based filtering** with **weighted feature matching** to provide personalized movie recommendations. It integrates seamlessly with the TMDB API and maintains the existing UI while replacing mock data with real ML-powered suggestions.

## Key Features

✅ **Real TMDB Integration** - Fetches live movie data from The Movie Database  
✅ **Content-Based ML Algorithm** - Analyzes movie features for similarity matching  
✅ **User-Configurable Weights** - Adjust importance of different movie attributes  
✅ **Feature-Rich Matching** - Considers genres, ratings, cast, directors, themes, and more  
✅ **Scalable Architecture** - Handles large datasets with efficient processing  
✅ **Existing UI Preserved** - Maintains the beautiful two-pane interface and weight controls  

## How It Works

### 1. Feature Extraction
For each movie, the system extracts comprehensive features:
- **Genres** - One-hot encoded genre vectors
- **Ratings** - Normalized vote averages (0-1)  
- **Year** - Release year normalized to historical range
- **Popularity** - Log-scaled popularity scores
- **Cast & Crew** - Top actors and directors
- **Keywords** - Generated from title and overview
- **Language** - Original language encoding
- **Runtime** - Normalized movie duration

### 2. User Profile Generation
When users select favorite movies, the system:
- Aggregates features from all selected movies
- Identifies most common genres, cast, directors
- Calculates average ratings, years, popularity
- Creates a composite user preference profile

### 3. Similarity Calculation
The ML algorithm uses **weighted cosine similarity** to match movies:
- **Genre Similarity** - Jaccard similarity between genre sets
- **Rating Similarity** - Normalized rating difference
- **Cast/Director Matching** - String similarity for people
- **Keyword Matching** - Theme and content overlap
- **Year Proximity** - Temporal preference matching
- **Feature Vector Similarity** - Overall numerical feature matching

### 4. Weighted Scoring
Final recommendations are scored using user-defined weights:
```typescript
finalScore = (
  genreSimilarity * (genreWeight / 100) +
  ratingSimilarity * (ratingWeight / 100) +
  // ... other weighted features
) / totalWeights
```

## API Endpoints

### `/api/ml-recommendations` (POST)

Generate ML-powered movie recommendations.

**Request Body:**
```json
{
  "selectedMovies": [
    {
      "id": 550,
      "title": "Fight Club",
      "overview": "A ticking-time-bomb insomniac...",
      "release_date": "1999-10-15",
      "vote_average": 8.8,
      "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "genre_ids": [18],
      "popularity": 89.0,
      "original_language": "en"
    }
  ],
  "weights": {
    "genre": 75,
    "rating": 60, 
    "director": 50,
    "cast": 65,
    "cinematography": 40,
    "keywords": 55,
    "year": 30
  },
  "limit": 20,
  "minScore": 0.1,
  "candidateSource": "mixed"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "movie": {
        "id": 13,
        "title": "Forrest Gump",
        // ... full movie object
      },
      "score": 0.847,
      "reasons": [
        "Similar genres: Drama", 
        "Similar rating (8.8/10)",
        "From similar era (1994)"
      ],
      "tmdbImageUrl": "https://image.tmdb.org/t/p/w500/poster.jpg"
    }
  ],
  "metadata": {
    "totalCandidates": 200,
    "selectedMoviesCount": 1,
    "weights": { /* weights used */ },
    "candidateSource": "mixed"
  }
}
```

## Weight Configuration

Users can fine-tune recommendations using these weights:

| Weight | Description | Range |
|--------|-------------|-------|
| **Genre** | Importance of genre matching | 0-100 |
| **Rating** | Preference for similar ratings | 0-100 |
| **Director** | Director style similarity | 0-100 |
| **Cast** | Actor preference matching | 0-100 |
| **Cinematography** | Visual style similarity | 0-100 |
| **Keywords** | Theme/content matching | 0-100 |
| **Year** | Release year proximity | 0-100 |

## Candidate Sources

The system can pull candidate movies from different TMDB datasets:

- **`popular`** - Currently popular movies
- **`top_rated`** - Highest-rated movies of all time  
- **`discover`** - Filtered discovery with genre/year constraints
- **`mixed`** - Combination of popular + top-rated + similar movies

## Usage in UI

### Two-Pane Recommender Interface

1. **Search and Select Movies** - Users search TMDB and select favorites
2. **Adjust Weights** - Fine-tune importance of different movie aspects  
3. **Generate Recommendations** - Click "Update Results" to get ML suggestions
4. **View Results** - Recommendations show with match percentages and reasons

### Features:
- Real-time TMDB movie search
- Drag-and-drop weight sliders
- Match percentage indicators
- Detailed recommendation reasoning
- Responsive mobile/desktop design
- Sort by relevance, rating, year, popularity

## File Structure

```
lib/
├── ml-recommender.ts           # Core ML recommendation algorithm
├── tmdb-supabase.ts           # TMDB API integration
└── test-ml-recommendations.ts  # Testing utilities

app/api/
└── ml-recommendations/
    └── route.ts               # ML recommendation API endpoint

components/
└── two-pane-recommender-ui.tsx # Updated UI with ML integration
```

## Performance Considerations

- **Candidate Limiting** - Processes max 200 movies for performance
- **Feature Caching** - Movie features extracted once per session
- **Debounced Search** - 300ms delay for TMDB search requests
- **Async Processing** - Non-blocking recommendation generation
- **Error Handling** - Graceful fallbacks for API failures

## Future Enhancements

- **Collaborative Filtering** - User behavior patterns
- **Hybrid Recommendations** - Combine content + collaborative approaches
- **Vector Embeddings** - Pre-computed movie embeddings for faster similarity
- **Personalization** - Learn from user interaction history
- **Real-time Updates** - Live recommendation updates as weights change

## Testing

Run the test suite to verify ML recommendations:

```typescript
import { testMLRecommendations } from '@/lib/test-ml-recommendations'

// Test the recommendation system
await testMLRecommendations()
```

The test covers:
- Drama-focused recommendations
- Action-focused recommendations  
- Balanced preference matching
- Score calculation verification
- Recommendation reasoning

## Migration from Mock Data

The system seamlessly replaces mock data while preserving:
- ✅ All existing UI components and styling
- ✅ Weight slider functionality  
- ✅ Grid layout and movie cards
- ✅ Mobile responsive design
- ✅ Sort and filter options

**Key Changes:**
- Movie search now uses live TMDB data
- Recommendations generated via ML algorithm
- Match percentages and reasoning displayed
- Error handling for API failures
- Loading states during processing

This creates a production-ready recommendation system that provides genuinely useful, personalized movie suggestions while maintaining the beautiful existing interface.