import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TMDB_BASE_URL = 'https://api.themoviedb.org';
const TMDB_READ_TOKEN = process.env.TMDB_READ_TOKEN ||
  process.env.TMDB_ACCESS_TOKEN ||
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNGRiZWYzOTRmOTAzNGMwM2ViNmM5M2E4ZjA0M2MwNSIsIm5iZiI6MTc1MjkzMTUwOS44MzMsInN1YiI6IjY4N2I5Y2I1ZGZmMDA4MWRhYzcyYzI1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RmEVeq7ssiU0LSkUj9ihGMySUeS3y3CbeKs_00BCsi4";

// Timeout wrapper for fetch with AbortController
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

async function retryFetch(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Shorter timeout for faster failure detection (10 seconds instead of default)
      const response = await fetchWithTimeout(url, options, 10000);

      if (response.ok) {
        return response;
      }

      // Don't retry client errors (4xx except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }

      // For 429 or 5xx, wait with exponential backoff (shorter delays)
      if (attempt < maxRetries) {
        const delay = Math.min(500 * Math.pow(2, attempt), 2000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Only retry once on timeout/network errors
      if (attempt < maxRetries && attempt === 0) {
        const delay = 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Mock/fallback data for when TMDB is unreachable
function getMockData(path: string): any {
  console.log('[TMDB Proxy] Using fallback mock data for:', path);

  // Genre list fallback
  if (path.includes('/genre/movie/list')) {
    return {
      genres: [
        { id: 28, name: "Action" }, { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" }, { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" }, { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" }, { id: 10751, name: "Family" },
        { id: 14, name: "Fantasy" }, { id: 36, name: "History" },
        { id: 27, name: "Horror" }, { id: 10402, name: "Music" },
        { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" },
        { id: 878, name: "Science Fiction" }, { id: 10770, name: "TV Movie" },
        { id: 53, name: "Thriller" }, { id: 10752, name: "War" },
        { id: 37, name: "Western" }
      ]
    };
  }

  // Movie list fallback (popular, top rated, etc.)
  const mockMovies = {
    page: 1,
    results: [
      {
        id: 912649,
        title: "Venom: The Last Dance",
        overview: "Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on Venom and Eddie's last dance.",
        poster_path: "/aosm8NMQ3UyoBVpSxyimorCQykC.jpg",
        backdrop_path: "/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg",
        release_date: "2024-10-22",
        vote_average: 6.8,
        popularity: 5589.912,
        genre_ids: [878, 28, 12]
      },
      {
        id: 558449,
        title: "Gladiator II",
        overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
        poster_path: "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
        backdrop_path: "/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg",
        release_date: "2024-11-13",
        vote_average: 7.0,
        popularity: 4320.543,
        genre_ids: [28, 12, 18]
      },
      {
        id: 1184918,
        title: "The Wild Robot",
        overview: "After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
        poster_path: "/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg",
        backdrop_path: "/4zlOPT9CrtIX05bBIkYxNZsm5zN.jpg",
        release_date: "2024-09-12",
        vote_average: 8.5,
        popularity: 3892.445,
        genre_ids: [16, 878, 10751]
      },
      {
        id: 933260,
        title: "The Substance",
        overview: "A fading celebrity decides to use a black market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.",
        poster_path: "/lqoMzCcZYEFK729d6qzt349fB4o.jpg",
        backdrop_path: "/7h6TqPB3ESmjuVbxCxAeB1c9OB1.jpg",
        release_date: "2024-09-07",
        vote_average: 7.3,
        popularity: 2845.221,
        genre_ids: [27, 878, 53]
      },
      {
        id: 1034062,
        title: "Moana 2",
        overview: "After receiving an unexpected call from her wayfinding ancestors, Moana journeys alongside Maui and a new crew to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she's ever faced.",
        poster_path: "/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg",
        backdrop_path: "/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg",
        release_date: "2024-11-27",
        vote_average: 7.0,
        popularity: 2734.198,
        genre_ids: [16, 12, 10751, 35]
      }
    ],
    total_pages: 500,
    total_results: 10000
  };

  return mockMovies;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Missing required path parameter' },
        { status: 400 }
      );
    }

    // Remove path from search params to forward remaining params
    searchParams.delete('path');
    const queryString = searchParams.toString();
    const tmdbUrl = `${TMDB_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

    try {
      // Try direct TMDB API first
      const response = await retryFetch(tmdbUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TMDB_READ_TOKEN}`,
          'Accept': 'application/json',
          'User-Agent': 'ScreenOnFire/1.0'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      const data = await response.json();

      return NextResponse.json(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      });
    } catch (fetchError) {
      // If direct TMDB fetch fails (likely blocked in India), try CORS proxy
      console.warn('[TMDB Proxy] Direct TMDB failed, trying CORS proxy:', fetchError);

      try {
        // Use cors.eu.org proxy (free, no rate limits, works in India)
        const proxyUrl = `https://cors.eu.org/${tmdbUrl}`;

        const proxyResponse = await fetchWithTimeout(proxyUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TMDB_READ_TOKEN}`,
            'Accept': 'application/json',
            'User-Agent': 'ScreenOnFire/1.0',
            'Origin': 'https://screenonfire.vercel.app'
          }
        }, 15000);

        if (!proxyResponse.ok) {
          throw new Error(`Proxy returned ${proxyResponse.status}`);
        }

        const proxyData = await proxyResponse.json();

        return NextResponse.json(proxyData, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
            'X-Proxy-Used': 'cors-eu'
          }
        });
      } catch (proxyError) {
        console.error('[TMDB Proxy] CORS proxy also failed:', proxyError);

        // Last resort: return mock data with clear indication
        const mockData = getMockData(path);
        return NextResponse.json(mockData, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
            'X-Fallback-Data': 'true',
            'X-Error': 'TMDB API unreachable in your region'
          }
        });
      }
    }

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch from TMDB API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}