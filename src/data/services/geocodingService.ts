const GEOCODE_API_URL = 'https://api.geoapify.com/v1/geocode/search';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE = 200;


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
    const firstKey = geocodeCache.keys().next().value;
    if (firstKey !== undefined) geocodeCache.delete(firstKey);
  }
  geocodeCache.set(key, { result, ts: Date.now() });
}


function apiKey(): string | undefined {
  return typeof process !== 'undefined'
    ? process.env?.EXPO_PUBLIC_GEOAPIFY_API_KEY
    : undefined;
}

export function isGeocodingAvailable(): boolean {
  const k = apiKey();
  return Boolean(k?.length && k !== 'your_geoapify_api_key');
}

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const key = apiKey();
  if (!key || key === 'your_geoapify_api_key') return null;

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
    if (e instanceof Error && e.name === 'AbortError') return null;
    return null;
  }
}

export async function geocodeAddresses(
  addresses: string[],
  signal?: AbortSignal,
): Promise<(GeocodeResult | null)[]> {
  return Promise.all(addresses.map((addr) => geocodeAddress(addr, signal)));
}
