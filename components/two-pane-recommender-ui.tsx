'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, X, RotateCcw, Grid3X3, Grid2X2, Star, Menu } from 'lucide-react';

// Type definitions
type Movie = {
  id: number;
  title: string;
  year?: number;
  posterPath?: string;
  poster_path?: string;
  genres?: string[];
  genre_names?: string[];
  rating?: number; // 0-10
  vote_average?: number;
  overview?: string;
  release_date?: string;
  popularity?: number;
  original_language?: string;
};

type RecommendationResult = {
  movie: Movie;
  score: number;
  reasons: string[];
  tmdbImageUrl?: string;
};

type Weights = {
  genre: number;
  rating: number;
  director: number;
  cast: number;
  cinematography: number;
  keywords: number;
  year: number;
};

// Mock data
const MOCK_MOVIES: Movie[] = [
  { id: 1, title: "Inception", year: 2010, posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", genres: ["Action", "Sci-Fi", "Thriller"], rating: 8.8 },
  { id: 2, title: "The Dark Knight", year: 2008, posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", genres: ["Action", "Crime", "Drama"], rating: 9.0 },
  { id: 3, title: "Interstellar", year: 2014, posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", genres: ["Adventure", "Drama", "Sci-Fi"], rating: 8.6 },
  { id: 4, title: "Parasite", year: 2019, posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", genres: ["Comedy", "Drama", "Thriller"], rating: 8.5 },
  { id: 5, title: "The Shawshank Redemption", year: 1994, posterPath: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", genres: ["Drama"], rating: 9.3 },
  { id: 6, title: "Pulp Fiction", year: 1994, posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", genres: ["Crime", "Drama"], rating: 8.9 },
  { id: 7, title: "The Matrix", year: 1999, posterPath: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", genres: ["Action", "Sci-Fi"], rating: 8.7 },
  { id: 8, title: "Goodfellas", year: 1990, posterPath: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", genres: ["Biography", "Crime", "Drama"], rating: 8.7 },
  { id: 9, title: "The Godfather", year: 1972, posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", genres: ["Crime", "Drama"], rating: 9.2 },
  { id: 10, title: "Forrest Gump", year: 1994, posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", genres: ["Drama", "Romance"], rating: 8.8 },
  { id: 11, title: "Fight Club", year: 1999, posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", genres: ["Drama"], rating: 8.8 },
  { id: 12, title: "The Lord of the Rings: The Return of the King", year: 2003, posterPath: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", genres: ["Action", "Adventure", "Drama"], rating: 8.9 },
  { id: 13, title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001, posterPath: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", genres: ["Action", "Adventure", "Drama"], rating: 8.8 },
  { id: 14, title: "Star Wars: Episode IV - A New Hope", year: 1977, posterPath: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", genres: ["Action", "Adventure", "Fantasy"], rating: 8.6 },
  { id: 15, title: "The Avengers", year: 2012, posterPath: "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg", genres: ["Action", "Adventure", "Sci-Fi"], rating: 8.0 },
  { id: 16, title: "Joker", year: 2019, posterPath: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", genres: ["Crime", "Drama", "Thriller"], rating: 8.4 },
  { id: 17, title: "1917", year: 2019, posterPath: "/iZf0KyrE25z1sage4SYFLCCrMi9.jpg", genres: ["Drama", "War"], rating: 8.3 },
  { id: 18, title: "Once Upon a Time in Hollywood", year: 2019, posterPath: "/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg", genres: ["Comedy", "Drama"], rating: 7.6 },
  { id: 19, title: "Knives Out", year: 2019, posterPath: "/pThyQovXQrw2m0s9x82twj48Jq4.jpg", genres: ["Comedy", "Crime", "Drama"], rating: 7.9 },
  { id: 20, title: "Dune", year: 2021, posterPath: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", genres: ["Action", "Adventure", "Drama"], rating: 8.0 }
];

// Extended movie database for search
const ALL_MOVIES: Movie[] = [
  ...MOCK_MOVIES,
  { id: 21, title: "Blade Runner 2049", year: 2017, posterPath: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", genres: ["Action", "Drama", "Sci-Fi"], rating: 8.0 },
  { id: 22, title: "Mad Max: Fury Road", year: 2015, posterPath: "/hA2ple9q4qnwxp3hKVNhroipsir.jpg", genres: ["Action", "Adventure", "Sci-Fi"], rating: 8.1 },
  { id: 23, title: "Ex Machina", year: 2014, posterPath: "/btTdmkgIvOi0FFip1sPuZI2oQG6.jpg", genres: ["Drama", "Sci-Fi", "Thriller"], rating: 7.7 },
  { id: 24, title: "The Social Network", year: 2010, posterPath: "/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg", genres: ["Biography", "Drama"], rating: 7.7 },
  { id: 25, title: "Whiplash", year: 2014, posterPath: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg", genres: ["Drama", "Music"], rating: 8.5 },
  { id: 26, title: "La La Land", year: 2016, posterPath: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg", genres: ["Comedy", "Drama", "Music", "Romance"], rating: 8.0 },
  { id: 27, title: "The Wolf of Wall Street", year: 2013, posterPath: "/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg", genres: ["Biography", "Comedy", "Crime", "Drama"], rating: 8.2 },
  { id: 28, title: "Her", year: 2013, posterPath: "/lEIaL12hSkqqe83kgADkbUqEnvk.jpg", genres: ["Drama", "Romance", "Sci-Fi"], rating: 8.0 },
  { id: 29, title: "Gone Girl", year: 2014, posterPath: "/lv5xShBIDPe7m4ufdlV0IAc7Avk.jpg", genres: ["Drama", "Mystery", "Thriller"], rating: 8.1 },
  { id: 30, title: "Moonlight", year: 2016, posterPath: "/4911T5FbJ9eD2Faz5Z8cT3SUhU.jpg", genres: ["Drama"], rating: 7.4 },
  { id: 31, title: "The Grand Budapest Hotel", year: 2014, posterPath: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg", genres: ["Adventure", "Comedy", "Crime"], rating: 8.1 },
  { id: 32, title: "Birdman", year: 2014, posterPath: "/rSZs93P0LLxqlVEbI001UKoeCQC.jpg", genres: ["Comedy", "Drama"], rating: 7.7 },
  { id: 33, title: "Mad Max", year: 1979, posterPath: "/z9Lv6CieR9Po5VCygGg2JWZSj3M.jpg", genres: ["Action", "Adventure", "Sci-Fi", "Thriller"], rating: 6.9 },
  { id: 34, title: "Arrival", year: 2016, posterPath: "/yImmxRokQ48PD49ughXdpKTAsQU.jpg", genres: ["Drama", "Sci-Fi"], rating: 7.9 },
  { id: 35, title: "Baby Driver", year: 2017, posterPath: "/rmnQ9jKW72bHu8uKlMjPIb2VLMI.jpg", genres: ["Action", "Crime", "Music"], rating: 7.6 },
  { id: 36, title: "Manchester by the Sea", year: 2016, posterPath: "/e8daDzP0vFOnGyKmve95Yv0D0io.jpg", genres: ["Drama"], rating: 7.8 },
  { id: 37, title: "Three Billboards Outside Ebbing, Missouri", year: 2017, posterPath: "/pZRhqJj0DBy4ghB7g6pU7MGHsWJ.jpg", genres: ["Comedy", "Crime", "Drama"], rating: 8.1 },
  { id: 38, title: "The Shape of Water", year: 2017, posterPath: "/9zfwPffUXpBrEP26yp0q1ckXDcj.jpg", genres: ["Adventure", "Drama", "Fantasy", "Romance"], rating: 7.3 },
  { id: 39, title: "Call Me by Your Name", year: 2017, posterPath: "/tcl3IdOOSMkRNsqLXlVj9gOw6Lp.jpg", genres: ["Drama", "Romance"], rating: 7.9 },
  { id: 40, title: "Dunkirk", year: 2017, posterPath: "/cUqEgoP6kj8ykfNjJx3Tl5zHCcN.jpg", genres: ["Action", "Drama", "History", "Thriller", "War"], rating: 7.8 },
  { id: 41, title: "Spider-Man: Into the Spider-Verse", year: 2018, posterPath: "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", genres: ["Action", "Adventure", "Animation", "Family", "Sci-Fi"], rating: 8.4 },
  { id: 42, title: "Black Panther", year: 2018, posterPath: "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg", genres: ["Action", "Adventure", "Sci-Fi"], rating: 7.3 },
  { id: 43, title: "A Star Is Born", year: 2018, posterPath: "/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg", genres: ["Drama", "Music", "Romance"], rating: 7.6 },
  { id: 44, title: "Green Book", year: 2018, posterPath: "/7BsvSuDQuoqhWmU2fL7W2GOcZHU.jpg", genres: ["Biography", "Comedy", "Drama"], rating: 8.2 },
  { id: 45, title: "Roma", year: 2018, posterPath: "/qqcamfIGYjWqpOy4vPDOUwVWnNa.jpg", genres: ["Drama"], rating: 7.7 },
  { id: 46, title: "Avengers: Endgame", year: 2019, posterPath: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", genres: ["Action", "Adventure", "Drama", "Sci-Fi"], rating: 8.4 },
  { id: 47, title: "Ford v Ferrari", year: 2019, posterPath: "/dR1Ju50iudrOh3YgfwkAU1g2HZe.jpg", genres: ["Action", "Biography", "Drama", "Sport"], rating: 8.1 },
  { id: 48, title: "Jojo Rabbit", year: 2019, posterPath: "/7GsM4mtM0worCtIVeiQt28HieeN.jpg", genres: ["Comedy", "Drama", "War"], rating: 7.9 },
  { id: 49, title: "Little Women", year: 2019, posterPath: "/yn5ihODtZ7ofn8pDYfxCmxh8AXI.jpg", genres: ["Drama", "Romance"], rating: 7.8 },
  { id: 50, title: "The Irishman", year: 2019, posterPath: "/mbm8k3GFhXS0ROd9AD1gqYbIFbM.jpg", genres: ["Biography", "Crime", "Drama"], rating: 7.8 },
  { id: 51, title: "Tenet", year: 2020, posterPath: "/k68nPLbIST6NP96JmTxmZijEvCA.jpg", genres: ["Action", "Sci-Fi", "Thriller"], rating: 7.4 },
  { id: 52, title: "Soul", year: 2020, posterPath: "/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg", genres: ["Animation", "Adventure", "Comedy", "Drama", "Family", "Fantasy", "Music"], rating: 8.0 },
  { id: 53, title: "Nomadland", year: 2020, posterPath: "/kP4hpzKEbR8H1PkNgsaMprJEAlb.jpg", genres: ["Drama"], rating: 7.3 },
  { id: 54, title: "Minari", year: 2020, posterPath: "/pB4C7qsUjEJ1J07WtU2lxOVFP1s.jpg", genres: ["Drama"], rating: 7.4 },
  { id: 55, title: "The Father", year: 2020, posterPath: "/pr3bEQ7Paz8gSGk0P6EOSlnWHfV.jpg", genres: ["Drama"], rating: 8.2 },
  { id: 56, title: "Spider-Man: No Way Home", year: 2021, posterPath: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", genres: ["Action", "Adventure", "Sci-Fi"], rating: 8.4 },
  { id: 57, title: "The Batman", year: 2022, posterPath: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg", genres: ["Action", "Crime", "Drama"], rating: 7.8 },
  { id: 58, title: "Top Gun: Maverick", year: 2022, posterPath: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", genres: ["Action", "Drama"], rating: 8.3 },
  { id: 59, title: "Everything Everywhere All at Once", year: 2022, posterPath: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg", genres: ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi"], rating: 7.8 },
  { id: 60, title: "The Banshees of Inisherin", year: 2022, posterPath: "/4yFG6cSPaCaPhyoIKJHHbXhMGNM.jpg", genres: ["Comedy", "Drama"], rating: 7.7 }
];

const DEFAULT_WEIGHTS: Weights = {
  genre: 75,
  rating: 60,
  director: 50,
  cast: 65,
  cinematography: 40,
  keywords: 55,
  year: 30
};

// MovieCard Component
const MovieCard: React.FC<{
  movie: Movie;
  loading?: boolean;
}> = ({ movie, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-neutral-900 rounded-2xl overflow-hidden shadow-lg animate-pulse" data-testid="movie-card-skeleton">
        <div className="aspect-[2/3] bg-neutral-800" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-neutral-800 rounded" />
          <div className="h-3 bg-neutral-800 rounded w-2/3" />
          <div className="h-3 bg-neutral-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const posterUrl = movie.posterPath 
    ? `https://image.tmdb.org/t/p/w342${movie.posterPath}`
    : '/placeholder.jpg';

  return (
    <div 
      className="bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
      data-testid="movie-card"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {movie.rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/80 rounded-full text-xs text-white">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-white text-sm leading-tight mb-1 line-clamp-2">
          {movie.title}
        </h3>
        {movie.year && (
          <p className="text-neutral-400 text-xs mb-2">{movie.year}</p>
        )}
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 3).map((genre, index) => (
              <span 
                key={index}
                className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// SelectedChip Component
const SelectedChip: React.FC<{
  movie: Movie;
  onRemove: () => void;
}> = ({ movie, onRemove }) => {
  return (
    <div 
      className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-full px-3 py-2 text-sm text-white group"
      data-testid="selected-chip"
    >
      <span className="truncate max-w-[150px]" title={`${movie.title} (${movie.year})`}>
        {movie.title}
      </span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-neutral-600 transition-colors flex-shrink-0"
        aria-label={`Remove ${movie.title}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

// MoviePicker Component
const MoviePicker: React.FC<{
  onAddMovie: (movie: Movie) => void;
  selectedMovies: Movie[];
}> = ({ onAddMovie, selectedMovies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search TMDB for movies
  const searchMovies = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/tmdb?path=/3/search/movie&query=${encodeURIComponent(query)}&page=1`);
      if (response.ok) {
        const data = await response.json();
        const movies: Movie[] = (data.results || []).slice(0, 10).map((tmdbMovie: any) => ({
          id: tmdbMovie.id,
          title: tmdbMovie.title,
          year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : undefined,
          posterPath: tmdbMovie.poster_path,
          poster_path: tmdbMovie.poster_path,
          genres: [], // Will be filled when selected
          genre_names: [],
          rating: tmdbMovie.vote_average,
          vote_average: tmdbMovie.vote_average,
          overview: tmdbMovie.overview,
          release_date: tmdbMovie.release_date,
          popularity: tmdbMovie.popularity,
          original_language: tmdbMovie.original_language
        }));
        
        const selectedIds = new Set(selectedMovies.map(m => m.id));
        setSearchResults(movies.filter(movie => !selectedIds.has(movie.id)));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [selectedMovies]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMovies(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchMovies]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          handleSelectMovie(searchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, highlightedIndex, searchResults]);

  const handleSelectMovie = useCallback((movie: Movie) => {
    onAddMovie(movie);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onAddMovie]);

  useEffect(() => {
    setIsOpen(searchResults.length > 0 && searchTerm.length >= 2);
    setHighlightedIndex(-1);
  }, [searchResults.length, searchTerm.length]);

  return (
    <div className="relative" data-testid="movie-picker">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for movies..."
          className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {isOpen && searchResults.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
        >
          {isSearching && (
            <div className="p-3 text-center text-neutral-400 text-sm">
              Searching TMDB...
            </div>
          )}
          {searchResults.map((movie, index) => {
            const posterUrl = movie.posterPath || movie.poster_path 
              ? `https://image.tmdb.org/t/p/w92${movie.posterPath || movie.poster_path}`
              : '/placeholder.jpg';
              
            return (
              <button
                key={movie.id}
                onClick={() => handleSelectMovie(movie)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-700 transition-colors ${
                  index === highlightedIndex ? 'bg-neutral-700' : ''
                }`}
              >
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-10 h-15 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {movie.title}
                  </div>
                  <div className="text-neutral-400 text-xs">
                    {movie.year} {movie.rating && `• ⭐ ${movie.rating.toFixed(1)}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// WeightSlider Component
const WeightSlider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  helpText?: string;
}> = ({ label, value, onChange, helpText }) => {
  return (
    <div className="space-y-2" data-testid="weight-slider">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-white">{label}</label>
        <span className="text-sm text-neutral-400">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
      />
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}
    </div>
  );
};

// Toolbar Component
const Toolbar: React.FC<{
  sortBy: string;
  onSortChange: (sort: string) => void;
  gridDensity: 'comfortable' | 'compact';
  onDensityChange: (density: 'comfortable' | 'compact') => void;
  resultsCount: number;
}> = ({ 
  sortBy, 
  onSortChange, 
  gridDensity, 
  onDensityChange,
  resultsCount 
}) => {
  return (
    <div className="sticky top-0 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-semibold text-white">AI Movie Recommendations</h2>
          
          <span className="text-neutral-400 text-sm">
            {resultsCount} results
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="year">Year</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => onDensityChange('comfortable')}
              className={`p-2 rounded transition-colors ${
                gridDensity === 'comfortable' 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Comfortable view"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDensityChange('compact')}
              className={`p-2 rounded transition-colors ${
                gridDensity === 'compact' 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Compact view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main TwoPaneRecommenderUI Component
const TwoPaneRecommenderUI: React.FC = () => {
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  // Handlers
  const handleAddMovie = useCallback((movie: Movie) => {
    setSelectedMovies(prev => {
      if (prev.find(m => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
  }, []);

  const handleRemoveMovie = useCallback((id: number) => {
    setSelectedMovies(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleWeightsChange = useCallback((partial: Partial<Weights>) => {
    setWeights(prev => ({ ...prev, ...partial }));
  }, []);


  const handleUpdateResults = useCallback(async () => {
    if (selectedMovies.length === 0) {
      setError('Please select at least one movie to get recommendations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert selected movies to TMDB format
      const tmdbMovies = selectedMovies.map(movie => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview || '',
        release_date: movie.release_date || `${movie.year || 2000}-01-01`,
        vote_average: movie.vote_average || movie.rating || 0,
        poster_path: movie.poster_path || movie.posterPath || null,
        backdrop_path: null,
        genre_ids: movie.genres?.map(g => {
          // Convert genre names to IDs (basic mapping)
          const genreMap: Record<string, number> = {
            'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
            'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
            'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
            'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
            'Sci-Fi': 878, 'Thriller': 53, 'War': 10752, 'Western': 37
          };
          return genreMap[g] || 18; // Default to Drama
        }) || [],
        popularity: movie.popularity || 50,
        original_language: movie.original_language || 'en'
      }));

      const response = await fetch('/api/ml-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedMovies: tmdbMovies,
          weights: weights,
          limit: 20,
          minScore: 0.1,
          candidateSource: 'mixed'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setMetadata(data.metadata);

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to get recommendations');
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMovies, weights]);

  const handleReset = useCallback(() => {
    setWeights(DEFAULT_WEIGHTS);
    setSelectedMovies([]);
    setRecommendations([]);
    setError(null);
    setMetadata(null);
  }, []);

  // Sort recommendations based on selected sort option
  const sortedRecommendations = useMemo(() => {
    if (recommendations.length === 0) return [];
    
    const sorted = [...recommendations];
    
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.movie.vote_average || b.movie.rating || 0) - (a.movie.vote_average || a.movie.rating || 0));
      case 'year':
        return sorted.sort((a, b) => {
          const yearA = a.movie.year || new Date(a.movie.release_date || '2000').getFullYear();
          const yearB = b.movie.year || new Date(b.movie.release_date || '2000').getFullYear();
          return yearB - yearA;
        });
      case 'popularity':
        return sorted.sort((a, b) => (b.movie.popularity || 0) - (a.movie.popularity || 0));
      case 'relevance':
      default:
        return sorted.sort((a, b) => b.score - a.score);
    }
  }, [recommendations, sortBy]);

  // Convert recommendations to Movie format for display
  const displayMovies: Movie[] = sortedRecommendations.map(rec => ({
    ...rec.movie,
    posterPath: rec.movie.poster_path || rec.movie.posterPath,
    rating: rec.movie.vote_average || rec.movie.rating,
    year: rec.movie.year || new Date(rec.movie.release_date || '2000').getFullYear(),
    genres: rec.movie.genre_names || rec.movie.genres || []
  }));

  const gridCols = gridDensity === 'comfortable' 
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  // Right pane content
  const rightPaneContent = (
    <div className="space-y-8">
      {/* Add Favorites Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Add your favorite movies</h2>
        <MoviePicker onAddMovie={handleAddMovie} selectedMovies={selectedMovies} />
        
        {selectedMovies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedMovies.map(movie => (
              <SelectedChip
                key={movie.id}
                movie={movie}
                onRemove={() => handleRemoveMovie(movie.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tune Recommendations Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Tune recommendations</h2>
        <div className="space-y-6">
          <WeightSlider
            label="Genre"
            value={weights.genre}
            onChange={(value) => handleWeightsChange({ genre: value })}
            helpText="Higher = stronger influence on ranking"
          />
          <WeightSlider
            label="Rating"
            value={weights.rating}
            onChange={(value) => handleWeightsChange({ rating: value })}
            helpText="Prefer higher-rated movies"
          />
          <WeightSlider
            label="Director"
            value={weights.director}
            onChange={(value) => handleWeightsChange({ director: value })}
            helpText="Match director style preferences"
          />
          <WeightSlider
            label="Cast"
            value={weights.cast}
            onChange={(value) => handleWeightsChange({ cast: value })}
            helpText="Consider actor preferences"
          />
          <WeightSlider
            label="Cinematography"
            value={weights.cinematography}
            onChange={(value) => handleWeightsChange({ cinematography: value })}
            helpText="Visual style similarity"
          />
          <WeightSlider
            label="Keywords"
            value={weights.keywords}
            onChange={(value) => handleWeightsChange({ keywords: value })}
            helpText="Theme and content matching"
          />
          <WeightSlider
            label="Year"
            value={weights.year}
            onChange={(value) => handleWeightsChange({ year: value })}
            helpText="Prefer recent or classic movies"
          />
        </div>
        
        <button
          onClick={handleReset}
          className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to defaults
        </button>
      </div>

      {/* Actions Section */}
      <div className="space-y-3">
        <button
          onClick={handleUpdateResults}
          disabled={isLoading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          {isLoading ? 'Updating...' : 'Update Results'}
        </button>
        <button
          onClick={handleReset}
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Left Pane - Recommendations */}
        <div className="flex-1 min-h-screen">
          <Toolbar
            sortBy={sortBy}
            onSortChange={setSortBy}
            gridDensity={gridDensity}
            onDensityChange={setGridDensity}
            resultsCount={displayMovies.length}
          />
          
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-200">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            {selectedMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-medium text-white mb-2">Pick a couple of favorites to get tailored picks</h3>
                <p className="text-neutral-400 max-w-md">
                  Start by searching and selecting movies you love in the controls panel. 
                  We'll use your choices to find perfect recommendations for you.
                </p>
              </div>
            ) : recommendations.length === 0 && !isLoading && !error ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-medium text-white mb-2">Ready to find your next favorite movie?</h3>
                <p className="text-neutral-400 max-w-md mb-6">
                  You've selected {selectedMovies.length} movie{selectedMovies.length > 1 ? 's' : ''}. 
                  Click "Update Results" to get personalized recommendations using our AI.
                </p>
                <button
                  onClick={handleUpdateResults}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Get My Recommendations
                </button>
              </div>
            ) : displayMovies.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-white mb-2">No recommendations found</h3>
                <p className="text-neutral-400 max-w-md">
                  Try adjusting your weights or selecting different movies to get better matches.
                </p>
                {metadata && (
                  <p className="text-neutral-500 text-sm mt-2">
                    Processed {metadata.totalCandidates} movies from TMDB
                  </p>
                )}
              </div>
            ) : (
              <>
                {metadata && (
                  <div className="mb-6 p-4 bg-neutral-900 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">AI Recommendations Generated</p>
                        <p className="text-neutral-400 text-sm">
                          Found {displayMovies.length} matches from {metadata.totalCandidates} movies
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-medium">{selectedMovies.length} favorites selected</p>
                        <p className="text-neutral-400 text-sm">Using {metadata.candidateSource} dataset</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={`grid gap-6 ${gridCols}`}>
                  {isLoading 
                    ? Array(12).fill(0).map((_, i) => (
                        <MovieCard
                          key={i}
                          movie={{} as Movie}
                          loading={true}
                        />
                      ))
                    : displayMovies.map((movie, index) => {
                        const recommendation = sortedRecommendations[index];
                        return (
                          <div key={movie.id} className="relative">
                            <MovieCard movie={movie} />
                            {recommendation && (
                              <div className="mt-2 p-3 bg-neutral-900 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-yellow-400 font-medium text-sm">
                                    Match: {Math.round(recommendation.score * 100)}%
                                  </span>
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                </div>
                                {recommendation.reasons.length > 0 && (
                                  <div className="space-y-1">
                                    {recommendation.reasons.slice(0, 2).map((reason, i) => (
                                      <p key={i} className="text-xs text-neutral-400">
                                        • {reason}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                  }
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Pane - Controls */}
        <div className="w-96 bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto max-h-screen">
          {rightPaneContent}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Toolbar
          sortBy={sortBy}
          onSortChange={setSortBy}
          gridDensity={gridDensity}
          onDensityChange={setGridDensity}
          resultsCount={displayMovies.length}
        />
        
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {selectedMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-lg font-medium text-white mb-2">Pick favorites to get recommendations</h3>
              <p className="text-neutral-400 text-sm">
                Tap the filter button to start selecting movies you love.
              </p>
            </div>
          ) : recommendations.length === 0 && !isLoading && !error ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-white mb-2">Ready for AI recommendations?</h3>
              <p className="text-neutral-400 text-sm mb-4">
                Selected {selectedMovies.length} movie{selectedMovies.length > 1 ? 's' : ''}. Tap "Update Results" to get started.
              </p>
            </div>
          ) : displayMovies.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-white mb-2">No matches found</h3>
              <p className="text-neutral-400 text-sm">
                Try adjusting your preferences in the filter panel.
              </p>
            </div>
          ) : (
            <>
              {metadata && (
                <div className="mb-4 p-3 bg-neutral-900 rounded-lg">
                  <p className="text-white text-sm font-medium">
                    AI found {displayMovies.length} matches from {metadata.totalCandidates} movies
                  </p>
                </div>
              )}
              
              <div className={`grid gap-4 ${gridCols}`}>
                {isLoading 
                  ? Array(8).fill(0).map((_, i) => (
                      <MovieCard
                        key={i}
                        movie={{} as Movie}
                        loading={true}
                      />
                    ))
                  : displayMovies.map((movie, index) => {
                      const recommendation = sortedRecommendations[index];
                      return (
                        <div key={movie.id} className="relative">
                          <MovieCard movie={movie} />
                          {recommendation && (
                            <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs px-2 py-1 rounded-full">
                              {Math.round(recommendation.score * 100)}%
                            </div>
                          )}
                        </div>
                      );
                    })
                }
              </div>
            </>
          )}
        </div>

        {/* Floating Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="fixed bottom-6 right-6 bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-full shadow-2xl transition-colors z-50"
          aria-label="Open filters"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Filter Panel */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsMobileFilterOpen(false)}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Filters & Preferences</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {rightPaneContent}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default TwoPaneRecommenderUI;