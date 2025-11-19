/**
 * ML-based Movie Recommendation System
 * Uses content-based filtering with weighted feature matching
 */

import { TMDBMovie, TMDBMovieDetails } from './tmdb-supabase'
import { getMovieDetailsServer } from './tmdb-server'

export interface MovieFeatures {
  id: number
  title: string
  genres: number[]
  genreNames: string[]
  rating: number
  year: number
  popularity: number
  runtime: number
  director: string[]
  cast: string[]
  keywords: string[]
  language: string
  featureVector: number[]
}

export interface RecommendationWeights {
  genre: number
  rating: number
  director: number
  cast: number
  cinematography: number
  keywords: number
  year: number
}

export interface RecommendationResult {
  movie: TMDBMovie
  score: number
  reasons: string[]
}

export interface RecommendationRequest {
  selectedMovies: TMDBMovie[]
  weights: RecommendationWeights
  excludeIds: number[]
  limit: number
  minScore?: number
}

/**
 * Extract comprehensive features from a movie
 */
export async function extractMovieFeatures(movie: TMDBMovie): Promise<MovieFeatures> {
  try {
    // Get detailed movie information
    const details = await getMovieDetailsServer(movie.id)
    
    // Extract year from release date
    const year = new Date(movie.release_date || '2000-01-01').getFullYear()
    
    // Extract genres
    const genres = details.genres?.map((g: { id: number; name: string }) => g.id) || movie.genre_ids || []
    const genreNames = details.genres?.map((g: { id: number; name: string }) => g.name) || []

    // Extract cast and crew
    const cast = details.credits?.cast?.slice(0, 10).map((c: { name: string; character: string }) => c.name.toLowerCase()) || []
    const director = details.credits?.crew
      ?.filter((c: { name: string; job: string }) => c.job === 'Director')
      .map((c: { name: string; job: string }) => c.name.toLowerCase()) || []
    
    // Generate keywords from title and overview
    const keywords = generateKeywords(movie.title, movie.overview)
    
    // Create feature vector
    const featureVector = createFeatureVector({
      genres,
      rating: movie.vote_average,
      year,
      popularity: movie.popularity || 0,
      runtime: details.runtime || 120,
      director,
      cast,
      keywords,
      language: movie.original_language || 'en'
    })
    
    return {
      id: movie.id,
      title: movie.title,
      genres,
      genreNames,
      rating: movie.vote_average,
      year,
      popularity: movie.popularity || 0,
      runtime: details.runtime || 120,
      director,
      cast,
      keywords,
      language: movie.original_language || 'en',
      featureVector
    }
  } catch (error) {
    console.warn(`Failed to extract features for movie ${movie.id}:`, error)
    
    // Return basic features as fallback
    const year = new Date(movie.release_date || '2000-01-01').getFullYear()
    const genres = movie.genre_ids || []
    const keywords = generateKeywords(movie.title, movie.overview)
    
    return {
      id: movie.id,
      title: movie.title,
      genres,
      genreNames: [],
      rating: movie.vote_average,
      year,
      popularity: movie.popularity || 0,
      runtime: 120,
      director: [],
      cast: [],
      keywords,
      language: movie.original_language || 'en',
      featureVector: createFeatureVector({
        genres,
        rating: movie.vote_average,
        year,
        popularity: movie.popularity || 0,
        runtime: 120,
        director: [],
        cast: [],
        keywords,
        language: movie.original_language || 'en'
      })
    }
  }
}

/**
 * Generate keywords from title and overview
 */
function generateKeywords(title: string, overview: string): string[] {
  const text = `${title} ${overview}`.toLowerCase()
  
  // Remove common words and punctuation
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ])
  
  return text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 20) // Limit to top 20 keywords
}

/**
 * Create a numerical feature vector from movie attributes
 */
function createFeatureVector(features: {
  genres: number[]
  rating: number
  year: number
  popularity: number
  runtime: number
  director: string[]
  cast: string[]
  keywords: string[]
  language: string
}): number[] {
  const vector: number[] = []
  
  // Genre features (one-hot encoding for common genres)
  const commonGenres = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37]
  commonGenres.forEach(genreId => {
    vector.push(features.genres.includes(genreId) ? 1 : 0)
  })
  
  // Normalized rating (0-1)
  vector.push(features.rating / 10)
  
  // Normalized year (relative to 1900-2030)
  vector.push((features.year - 1900) / 130)
  
  // Normalized popularity (log scale)
  vector.push(Math.log(features.popularity + 1) / 10)
  
  // Normalized runtime (0-1, assuming max 300 minutes)
  vector.push(Math.min(features.runtime / 300, 1))
  
  // Language features (common languages)
  const commonLanguages = ['en', 'hi', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh']
  commonLanguages.forEach(lang => {
    vector.push(features.language === lang ? 1 : 0)
  })
  
  return vector
}

/**
 * Calculate cosine similarity between two feature vectors
 */
function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i]
    normA += vectorA[i] * vectorA[i]
    normB += vectorB[i] * vectorB[i]
  }
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Calculate weighted similarity between two movies
 */
function calculateWeightedSimilarity(
  movieA: MovieFeatures,
  movieB: MovieFeatures,
  weights: RecommendationWeights
): { similarity: number; reasons: string[] } {
  const reasons: string[] = []
  let totalScore = 0
  let totalWeight = 0
  
  // Genre similarity
  if (weights.genre > 0) {
    const genreSimilarity = calculateGenreSimilarity(movieA.genres, movieB.genres)
    totalScore += genreSimilarity * (weights.genre / 100)
    totalWeight += weights.genre / 100
    
    if (genreSimilarity > 0.5) {
      const commonGenres = movieA.genreNames.filter(genre => 
        movieB.genreNames.includes(genre)
      )
      if (commonGenres.length > 0) {
        reasons.push(`Similar genres: ${commonGenres.join(', ')}`)
      }
    }
  }
  
  // Rating similarity
  if (weights.rating > 0) {
    const ratingDiff = Math.abs(movieA.rating - movieB.rating)
    const ratingSimilarity = Math.max(0, 1 - ratingDiff / 10)
    totalScore += ratingSimilarity * (weights.rating / 100)
    totalWeight += weights.rating / 100
    
    if (ratingSimilarity > 0.7) {
      reasons.push(`Similar rating (${movieB.rating.toFixed(1)}/10)`)
    }
  }
  
  // Director similarity
  if (weights.director > 0 && movieA.director.length > 0) {
    const directorSimilarity = calculateArraySimilarity(movieA.director, movieB.director)
    totalScore += directorSimilarity * (weights.director / 100)
    totalWeight += weights.director / 100
    
    if (directorSimilarity > 0.5) {
      reasons.push(`Familiar director style`)
    }
  }
  
  // Cast similarity
  if (weights.cast > 0) {
    const castSimilarity = calculateArraySimilarity(movieA.cast, movieB.cast)
    totalScore += castSimilarity * (weights.cast / 100)
    totalWeight += weights.cast / 100
    
    if (castSimilarity > 0.3) {
      reasons.push(`Similar cast members`)
    }
  }
  
  // Keywords similarity (representing cinematography/themes)
  if (weights.keywords > 0) {
    const keywordSimilarity = calculateArraySimilarity(movieA.keywords, movieB.keywords)
    totalScore += keywordSimilarity * (weights.keywords / 100)
    totalWeight += weights.keywords / 100
    
    if (keywordSimilarity > 0.3) {
      reasons.push(`Similar themes and style`)
    }
  }
  
  // Year similarity
  if (weights.year > 0) {
    const yearDiff = Math.abs(movieA.year - movieB.year)
    const yearSimilarity = Math.max(0, 1 - yearDiff / 50) // 50-year range
    totalScore += yearSimilarity * (weights.year / 100)
    totalWeight += weights.year / 100
    
    if (yearSimilarity > 0.8) {
      reasons.push(`From similar era (${movieB.year})`)
    }
  }
  
  // Cinematography similarity (using feature vector)
  if (weights.cinematography > 0) {
    const cinematographySimilarity = cosineSimilarity(movieA.featureVector, movieB.featureVector)
    totalScore += cinematographySimilarity * (weights.cinematography / 100)
    totalWeight += weights.cinematography / 100
  }
  
  const finalSimilarity = totalWeight > 0 ? totalScore / totalWeight : 0
  
  return { similarity: finalSimilarity, reasons }
}

/**
 * Calculate similarity between two genre arrays
 */
function calculateGenreSimilarity(genresA: number[], genresB: number[]): number {
  if (genresA.length === 0 || genresB.length === 0) return 0
  
  const setA = new Set(genresA)
  const setB = new Set(genresB)
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  
  return intersection.size / union.size // Jaccard similarity
}

/**
 * Calculate similarity between two string arrays
 */
function calculateArraySimilarity(arrayA: string[], arrayB: string[]): number {
  if (arrayA.length === 0 || arrayB.length === 0) return 0
  
  const setA = new Set(arrayA.map(s => s.toLowerCase()))
  const setB = new Set(arrayB.map(s => s.toLowerCase()))
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  
  return intersection.size / Math.max(setA.size, setB.size)
}

/**
 * Generate movie profile from user's selected movies
 */
export function generateUserProfile(selectedMovieFeatures: MovieFeatures[]): MovieFeatures {
  if (selectedMovieFeatures.length === 0) {
    throw new Error('No selected movies to generate profile from')
  }
  
  // Aggregate genres
  const allGenres = selectedMovieFeatures.flatMap(m => m.genres)
  const genreCounts = allGenres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1
    return acc
  }, {} as Record<number, number>)
  
  const topGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => parseInt(genre))
  
  // Calculate averages
  const avgRating = selectedMovieFeatures.reduce((sum, m) => sum + m.rating, 0) / selectedMovieFeatures.length
  const avgYear = selectedMovieFeatures.reduce((sum, m) => sum + m.year, 0) / selectedMovieFeatures.length
  const avgPopularity = selectedMovieFeatures.reduce((sum, m) => sum + m.popularity, 0) / selectedMovieFeatures.length
  const avgRuntime = selectedMovieFeatures.reduce((sum, m) => sum + m.runtime, 0) / selectedMovieFeatures.length
  
  // Aggregate keywords, directors, cast
  const allKeywords = selectedMovieFeatures.flatMap(m => m.keywords)
  const allDirectors = selectedMovieFeatures.flatMap(m => m.director)
  const allCast = selectedMovieFeatures.flatMap(m => m.cast)
  
  const topKeywords = getMostCommon(allKeywords, 10)
  const topDirectors = getMostCommon(allDirectors, 5)
  const topCast = getMostCommon(allCast, 10)
  
  // Most common language
  const languages = selectedMovieFeatures.map(m => m.language)
  const topLanguage = getMostCommon(languages, 1)[0] || 'en'
  
  return {
    id: -1, // Profile ID
    title: 'User Profile',
    genres: topGenres,
    genreNames: [],
    rating: avgRating,
    year: Math.round(avgYear),
    popularity: avgPopularity,
    runtime: Math.round(avgRuntime),
    director: topDirectors,
    cast: topCast,
    keywords: topKeywords,
    language: topLanguage,
    featureVector: createFeatureVector({
      genres: topGenres,
      rating: avgRating,
      year: Math.round(avgYear),
      popularity: avgPopularity,
      runtime: Math.round(avgRuntime),
      director: topDirectors,
      cast: topCast,
      keywords: topKeywords,
      language: topLanguage
    })
  }
}

/**
 * Get most common items from array
 */
function getMostCommon<T>(arr: T[], limit: number): T[] {
  const counts = arr.reduce((acc, item) => {
    acc[item as string] = (acc[item as string] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item as T)
}

/**
 * Main recommendation function
 */
export async function generateRecommendations(
  request: RecommendationRequest,
  candidateMovies: TMDBMovie[]
): Promise<RecommendationResult[]> {
  try {
    console.log(`Starting recommendation generation for ${request.selectedMovies.length} selected movies and ${candidateMovies.length} candidates`)
    
    // Extract features for selected movies with error handling
    const selectedFeatures: MovieFeatures[] = []
    
    for (const movie of request.selectedMovies) {
      try {
        const features = await extractMovieFeatures(movie)
        selectedFeatures.push(features)
      } catch (error) {
        console.warn(`Failed to extract features for selected movie ${movie.id} (${movie.title}):`, error)
        // Continue with other movies rather than failing entirely
      }
    }
    
    if (selectedFeatures.length === 0) {
      console.error('Failed to extract features for any selected movies')
      return []
    }
    
    console.log(`Successfully extracted features for ${selectedFeatures.length} selected movies`)
    
    // Generate user profile
    const userProfile = generateUserProfile(selectedFeatures)
    console.log(`Generated user profile with top genres: ${userProfile.genres.slice(0, 3).join(', ')}`)
    
    // Filter out excluded movies
    const filteredCandidates = candidateMovies.filter(
      movie => !request.excludeIds.includes(movie.id)
    )
    
    console.log(`Processing ${filteredCandidates.length} candidate movies (after exclusions)`)
    
    // Calculate recommendations with parallel processing in batches
    const recommendations: RecommendationResult[] = []
    const batchSize = 10 // Process candidates in smaller batches
    
    for (let i = 0; i < filteredCandidates.length; i += batchSize) {
      const batch = filteredCandidates.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (candidate) => {
        try {
          const candidateFeatures = await extractMovieFeatures(candidate)
          
          // Calculate similarity to user profile
          const { similarity, reasons } = calculateWeightedSimilarity(
            userProfile,
            candidateFeatures,
            request.weights
          )
          
          // Apply minimum score filter
          if (similarity >= (request.minScore || 0.1)) {
            return {
              movie: candidate,
              score: similarity,
              reasons
            }
          }
          return null
        } catch (error) {
          console.warn(`Failed to process candidate movie ${candidate.id} (${candidate.title}):`, error)
          return null
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      const validResults = batchResults.filter((result): result is RecommendationResult => result !== null)
      recommendations.push(...validResults)
      
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}, found ${validResults.length} valid recommendations`)
    }
    
    console.log(`Total recommendations found: ${recommendations.length}`)
    
    // Sort by score and return top results
    const finalRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, request.limit)
      
    console.log(`Returning top ${finalRecommendations.length} recommendations`)
    return finalRecommendations
      
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}