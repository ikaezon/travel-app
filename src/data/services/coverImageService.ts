/**
 * Cover image service using Unsplash.
 *
 * Fetches destination-relevant photos for trip covers.
 * Results are cached in-memory with a 24-hour TTL to reduce API usage.
 *
 * Unsplash demo: 50 requests/hour
 * Unsplash production: 5,000 requests/hour
 */

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE = 100;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UnsplashPhoto = {
  urls?: {
    raw?: string;
    full?: string;
    regular?: string;
    small?: string;
    thumb?: string;
  };
};

type UnsplashSearchResponse = {
  results?: UnsplashPhoto[];
};

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const coverImageCache = new Map<string, { url: string; ts: number }>();

function cacheKey(destination: string): string {
  return destination.trim().toLowerCase();
}

function getCached(destination: string): string | null {
  const key = cacheKey(destination);
  const entry = coverImageCache.get(key);
  if (!entry || Date.now() - entry.ts > CACHE_TTL_MS) {
    if (entry) coverImageCache.delete(key);
    return null;
  }
  return entry.url;
}

function setCached(destination: string, url: string): void {
  const key = cacheKey(destination);
  if (coverImageCache.size >= MAX_CACHE) {
    // Evict oldest entry
    const firstKey = coverImageCache.keys().next().value;
    if (firstKey !== undefined) coverImageCache.delete(firstKey);
  }
  coverImageCache.set(key, { url, ts: Date.now() });
}

// ---------------------------------------------------------------------------
// API key
// ---------------------------------------------------------------------------

function apiKey(): string | undefined {
  return typeof process !== 'undefined'
    ? process.env?.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY
    : undefined;
}

/**
 * Whether cover image fetching is available (API key is configured).
 */
export function isCoverImageAvailable(): boolean {
  const k = apiKey();
  return Boolean(k?.length && k !== 'your_unsplash_access_key');
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

/**
 * Fetch a cover image URL for a given destination.
 *
 * @param destination - Trip destination (e.g., "Paris, France")
 * @returns Image URL on success, null on failure
 */
export async function fetchCoverImageForDestination(
  destination: string
): Promise<string | null> {
  if (!destination.trim()) return null;
  if (!isCoverImageAvailable()) return null;

  // Check cache first
  const cached = getCached(destination);
  if (cached) return cached;

  const key = apiKey();
  if (!key) return null;

  try {
    const query = encodeURIComponent(destination.trim());
    const url = `${UNSPLASH_API_URL}?query=${query}&orientation=landscape&per_page=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${key}`,
      },
    });

    if (!response.ok) {
      console.warn(`[coverImageService] Unsplash API error: ${response.status}`);
      return null;
    }

    const data: UnsplashSearchResponse = await response.json();
    const firstPhoto = data.results?.[0];
    const imageUrl = firstPhoto?.urls?.regular ?? firstPhoto?.urls?.small ?? null;

    if (imageUrl) {
      // Optionally add width parameter to optimize for card size (800px)
      const optimizedUrl = imageUrl.includes('?')
        ? `${imageUrl}&w=800`
        : `${imageUrl}?w=800`;
      setCached(destination, optimizedUrl);
      return optimizedUrl;
    }

    return null;
  } catch (error) {
    console.warn('[coverImageService] Failed to fetch cover image:', error);
    return null;
  }
}
