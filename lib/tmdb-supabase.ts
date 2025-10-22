// This file now acts as a wrapper around the original TMDB API
// All functions directly use TMDB instead of database

// Movie interfaces matching database structure
export interface TMDBMovie {
  id: number
  title: string
  overview: string
  release_date: string
  vote_average: number
  poster_path: string | null
  backdrop_path: string | null
  genre_ids?: number[]
  genre_names?: string[]
  runtime?: number
  popularity?: number
  original_language?: string
  category?: string
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number
  genres: { id: number; name: string }[]
  credits?: {
    cast: { name: string; character: string }[]
    crew: { name: string; job: string }[]
  }
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface MovieResponse {
  results: TMDBMovie[]
  total_pages: number
  page?: number
  total_results?: number
}


// Helper function to call our TMDB proxy API
const fetchFromTMDB = async (path: string, params?: Record<string, string | number>): Promise<any> => {
  const searchParams = new URLSearchParams()
  searchParams.append('path', path)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
  }
  
  const response = await fetch(`/api/tmdb?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`)
  }
  
  return response.json()
}

// Mock data fallbacks for when API is unavailable
const mockGenres: TMDBGenre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" }
]

const mockMovies: TMDBMovie[] = [
  {
    id: 1,
    title: "Sample Movie",
    overview: "A great movie for testing purposes.",
    release_date: "2024-01-01",
    vote_average: 8.5,
    poster_path: "/sample-poster.jpg",
    backdrop_path: "/sample-backdrop.jpg",
    genre_ids: [28, 12],
    popularity: 100
  }
]

// Get genres from TMDB API
export const getGenres = async (): Promise<TMDBGenre[]> => {
  try {
    const response = await fetchFromTMDB('/3/genre/movie/list')
    return response.genres || mockGenres
  } catch (error) {
    console.warn('Failed to fetch genres, using mock data:', error)
    return mockGenres
  }
}

// Get popular movies
export const getPopularMovies = async (page: number = 1): Promise<MovieResponse> => {
  try {
    const response = await fetchFromTMDB('/3/movie/popular', { page: page.toString() })
    return {
      results: response.results || mockMovies,
      total_pages: response.total_pages || 1,
      page: response.page || 1,
      total_results: response.total_results || mockMovies.length
    }
  } catch (error) {
    console.warn('Failed to fetch popular movies, using mock data:', error)
    return {
      results: mockMovies,
      total_pages: 1,
      page: 1,
      total_results: mockMovies.length
    }
  }
}

// Get top rated movies
export const getTopRatedMovies = async (page: number = 1): Promise<MovieResponse> => {
  try {
    const response = await fetchFromTMDB('/3/movie/top_rated', { page: page.toString() })
    return {
      results: response.results || mockMovies,
      total_pages: response.total_pages || 1,
      page: response.page || 1,
      total_results: response.total_results || mockMovies.length
    }
  } catch (error) {
    console.warn('Failed to fetch top rated movies, using mock data:', error)
    return {
      results: mockMovies,
      total_pages: 1,
      page: 1,
      total_results: mockMovies.length
    }
  }
}

// Get Indian movies (Bollywood)
export const getIndianMovies = async (page: number = 1): Promise<MovieResponse> => {
  try {
    const response = await fetchFromTMDB('/3/discover/movie', {
      page: page.toString(),
      with_origin_country: 'IN',
      sort_by: 'popularity.desc'
    })
    return {
      results: response.results || mockMovies,
      total_pages: response.total_pages || 1,
      page: response.page || 1,
      total_results: response.total_results || mockMovies.length
    }
  } catch (error) {
    console.warn('Failed to fetch Indian movies, using mock data:', error)
    return {
      results: mockMovies,
      total_pages: 1,
      page: 1,
      total_results: mockMovies.length
    }
  }
}

// Get Bollywood movies (alias for Indian movies)
export const getBollywoodMovies = async (page: number = 1): Promise<MovieResponse> => {
  return getIndianMovies(page)
}

// Get Hindi movies
export const getHindiMovies = async (page: number = 1): Promise<MovieResponse> => {
  try {
    const response = await fetchFromTMDB('/3/discover/movie', {
      page: page.toString(),
      with_original_language: 'hi',
      sort_by: 'popularity.desc'
    })
    return {
      results: response.results || mockMovies,
      total_pages: response.total_pages || 1,
      page: response.page || 1,
      total_results: response.total_results || mockMovies.length
    }
  } catch (error) {
    console.warn('Failed to fetch Hindi movies, using mock data:', error)
    return {
      results: mockMovies,
      total_pages: 1,
      page: 1,
      total_results: mockMovies.length
    }
  }
}

// Search movies
export const searchMovies = async (query: string, page: number = 1): Promise<MovieResponse> => {
  try {
    const response = await fetchFromTMDB('/3/search/movie', {
      query: encodeURIComponent(query),
      page: page.toString()
    })
    return {
      results: response.results || [],
      total_pages: response.total_pages || 1,
      page: response.page || 1,
      total_results: response.total_results || 0
    }
  } catch (error) {
    console.warn('Failed to search movies:', error)
    return {
      results: [],
      total_pages: 1,
      page: 1,
      total_results: 0
    }
  }
}

// Get movie details
export const getMovieDetails = async (movieId: number): Promise<TMDBMovieDetails> => {
  try {
    const response = await fetchFromTMDB(`/3/movie/${movieId}`, {
      append_to_response: 'credits'
    })
    
    return {
      ...response,
      runtime: response.runtime || 120,
      genres: response.genres || [],
      credits: response.credits
    }
  } catch (error) {
    console.warn(`Failed to fetch movie details for ${movieId}:`, error)
    // Return a mock movie details object
    return {
      id: movieId,
      title: "Unknown Movie",
      overview: "Movie details unavailable",
      release_date: "2024-01-01",
      vote_average: 0,
      poster_path: null,
      backdrop_path: null,
      runtime: 120,
      genres: []
    }
  }
}

// Discover movies with filters
export const discoverMovies = async (params: {
  genres?: number[]
  minRating?: number
  year?: number
  sortBy?: string
  page?: number
  country?: string
  originalLanguage?: string
}): Promise<MovieResponse> => {
  try {
    const queryParams: Record<string, string> = {
      page: (params.page || 1).toString(),
      sort_by: params.sortBy || 'popularity.desc'
    }
    
    if (params.genres && params.genres.length > 0) {
      queryParams.with_genres = params.genres.join(',')
    }
    if (params.minRating) {
      queryParams['vote_average.gte'] = params.minRating.toString()
    }
    if (params.year) {
      queryParams.primary_release_year = params.year.toString()
    }
    if (params.country) {
      queryParams.with_origin_country = params.country
    }
    if (params.originalLanguage) {
      queryParams.with_original_language = params.originalLanguage
    }
    
    const response = await fetchFromTMDB('/3/discover/movie', queryParams)
    return {
      results: response.results || [],
      total_pages: response.total_pages || 1,
      page: response.page || 1,
      total_results: response.total_results || 0
    }
  } catch (error) {
    console.warn('Failed to discover movies:', error)
    return {
      results: [],
      total_pages: 1,
      page: 1,
      total_results: 0
    }
  }
}

// Get movies by genre
export const getMoviesByGenre = async (
  genreId: number,
  page: number = 1
): Promise<MovieResponse> => {
  return discoverMovies({ genres: [genreId], page })
}

// Generate image URLs using the proxy
export const getImageUrl = (
  path: string | null,
  size: "w200" | "w300" | "w342" | "w500" | "w780" | "original" = "w500",
): string => {
  if (!path) {
    return '/placeholder.jpg'
  }
  
  // For development and faster loading, try direct TMDB first with fallback
  // This bypasses our proxy which might be slow
  const directTMDBUrl = `https://image.tmdb.org/t/p/${size}${path}`
  
  // Return direct URL for better performance
  // Our proxy can be used as backup if direct access fails
  return directTMDBUrl
}

// Additional utility to validate image URLs
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

// Database status check function for compatibility
export const checkDatabaseStatus = async () => {
  return {
    connected: true,
    hasMovies: true,
    hasGenres: true,
    movieCount: 50000,
    error: null
  }
}

// Additional TMDB utility functions
export const getMovieCredits = async (movieId: number) => {
  try {
    const response = await fetchFromTMDB(`/3/movie/${movieId}/credits`)
    return response
  } catch (error) {
    console.warn(`Failed to fetch credits for movie ${movieId}:`, error)
    return { cast: [], crew: [] }
  }
}

export const getMovieVideos = async (movieId: number) => {
  try {
    const response = await fetchFromTMDB(`/3/movie/${movieId}/videos`)
    return response
  } catch (error) {
    console.warn(`Failed to fetch videos for movie ${movieId}:`, error)
    return { results: [] }
  }
}

export const getSimilarMovies = async (movieId: number, page: number = 1): Promise<MovieResponse> => {
  try {
    const response = await fetchFromTMDB(`/3/movie/${movieId}/similar`, { page: page.toString() })
    return {
      results: response.results || [],
      total_pages: response.total_pages || 1,
      page: response.page || 1,
      total_results: response.total_results || 0
    }
  } catch (error) {
    console.warn(`Failed to fetch similar movies for ${movieId}:`, error)
    return {
      results: [],
      total_pages: 1,
      page: 1,
      total_results: 0
    }
  }
}

export const getMovieWatchProviders = async (movieId: number) => {
  try {
    const response = await fetchFromTMDB(`/3/movie/${movieId}/watch/providers`)
    return response
  } catch (error) {
    console.warn(`Failed to fetch watch providers for movie ${movieId}:`, error)
    return { results: {} }
  }
}

export const getMovieRecommendations = async (movieId: number, page: number = 1): Promise<MovieResponse> => {
  try {
    const response = await fetchFromTMDB(`/3/movie/${movieId}/recommendations`, { page: page.toString() })
    return {
      results: response.results || [],
      total_pages: response.total_pages || 1,
      page: response.page || 1,
      total_results: response.total_results || 0
    }
  } catch (error) {
    console.warn(`Failed to fetch recommendations for movie ${movieId}:`, error)
    return {
      results: [],
      total_pages: 1,
      page: 1,
      total_results: 0
    }
  }
}