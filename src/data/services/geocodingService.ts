/**
 * Geocoding service using Geoapify.
 *
 * Converts text addresses into lat/lon coordinates.
 * Results are cached in-memory with a 24-hour TTL to reduce API usage.
 *
 * Geoapify free tier: 3,000 credits/day, 1 credit per geocode request.
 */

const GEOCODE_API_URL = 'https://api.geoapify.com/v1/geocode/search';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE = 200;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GeocodeResult {
  lat: number;
  lon: number;
}

type ApiFeature = {
  properties?: Record<string, unknown>;
  geometry?: { coordinates?: [number, number] };
};

type ApiResponse = {
  features?: ApiFeature[];
};

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const geocodeCache = new Map<string, { result: GeocodeResult; ts: number }>();

function cacheKey(address: string): string {
  return address.trim().toLowerCase();
}

function getCached(address: string): GeocodeResult | null {
  const key = cacheKey(address);
  const entry = geocodeCache.get(key);
  if (!entry || Date.now() - entry.ts > CACHE_TTL_MS) {
    if (entry) geocodeCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCached(address: string, result: GeocodeResult): void {
  const key = cacheKey(address);
  if (geocodeCache.size >= MAX_CACHE) {
    // Evict oldest entry
    const firstKey = geocodeCache.keys().next().value;
    if (firstKey !== undefined) geocodeCache.delete(firstKey);
  }
  geocodeCache.set(key, { result, ts: Date.now() });
}

// ---------------------------------------------------------------------------
// API key
// ---------------------------------------------------------------------------

function apiKey(): string | undefined {
  return typeof process !== 'undefined'
    ? process.env?.EXPO_PUBLIC_GEOAPIFY_API_KEY
    : undefined;
}

/**
 * Whether geocoding is available (API key is configured).
 */
export function isGeocodingAvailable(): boolean {
  const k = apiKey();
  return Boolean(k?.length && k !== 'your_geoapify_api_key');
}

// ---------------------------------------------------------------------------
// Geocode
// ---------------------------------------------------------------------------

/**
 * Geocode a text address into lat/lon coordinates.
 *
 * Returns `null` if:
 * - The API key is missing or invalid
 * - The address is empty
 * - The API call fails or returns no results
 *
 * This function never throws — callers can safely await and handle `null`.
 */
export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const key = apiKey();
  if (!key || key === 'your_geoapify_api_key') return null;

  // Check cache first
  const cached = getCached(trimmed);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      text: trimmed,
      apiKey: key,
      limit: '1',
    });

    const res = await fetch(`${GEOCODE_API_URL}?${params}`, { signal });
    if (!res.ok) return null;

    const data = (await res.json()) as ApiResponse;
    const feature = data.features?.[0];
    if (!feature) return null;

    // Prefer properties.lat/lon, fall back to geometry.coordinates
    const props = feature.properties ?? {};
    let lat = props.lat as number | undefined;
    let lon = props.lon as number | undefined;

    if (lat == null || lon == null) {
      const coords = feature.geometry?.coordinates;
      if (coords && coords.length >= 2) {
        lon = coords[0];
        lat = coords[1];
      }
    }

    if (lat == null || lon == null) return null;

    const result: GeocodeResult = { lat, lon };
    setCached(trimmed, result);
    return result;
  } catch (e) {
    // Abort errors and network failures are handled gracefully
    if (e instanceof Error && e.name === 'AbortError') return null;
    return null;
  }
}

/**
 * Geocode multiple addresses in parallel.
 * Returns results in the same order as input. Failed entries are `null`.
 */
export async function geocodeAddresses(
  addresses: string[],
  signal?: AbortSignal,
): Promise<(GeocodeResult | null)[]> {
  return Promise.all(addresses.map((addr) => geocodeAddress(addr, signal)));
}
