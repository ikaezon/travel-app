const API_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';
const DEBOUNCE_MS = 50;
const MIN_LEN = 2;
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE = 100;
const SHOW_STATE = new Set(['US', 'CA', 'AU']);

export interface PlaceSuggestion {
  formatted: string;
  city?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  placeId: string;
  importance?: number;
}

type ApiFeature = { properties?: Record<string, unknown> };
type ApiResponse = { features?: ApiFeature[] };

const cache = new Map<string, { list: PlaceSuggestion[]; ts: number }>();

export interface PlaceAutocompleteService {
  debouncedFetchSuggestions: (query: string, onResult: (suggestions: PlaceSuggestion[]) => void) => void;
  cancel: () => void;
}

export function createPlaceAutocompleteService(): PlaceAutocompleteService {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastAbort: AbortController | null = null;

  return {
    debouncedFetchSuggestions(query: string, onResult: (suggestions: PlaceSuggestion[]) => void): void {
      const q = query.trim();
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = null;

      if (q.length < MIN_LEN) {
        onResult([]);
        return;
      }

      debounceTimer = setTimeout(async () => {
        debounceTimer = null;
        lastAbort?.abort();
        const ac = new AbortController();
        lastAbort = ac;

        const cached = getCached(q);
        if (cached) onResult(cached);

        const list = await fetchPlaceSuggestions(q, ac.signal);
        if (!ac.signal.aborted) onResult(list);
      }, DEBOUNCE_MS);
    },

    cancel(): void {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = null;
      lastAbort?.abort();
      lastAbort = null;
    },
  };
}

function apiKey(): string | undefined {
  return typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_GEOAPIFY_API_KEY : undefined;
}

export function isPlaceAutocompleteAvailable(): boolean {
  const k = apiKey();
  return Boolean(k?.length && k !== 'your_geoapify_api_key');
}

function formatLabel(p: Record<string, unknown>): string {
  const city = p.city as string | undefined;
  const state = p.state as string | undefined;
  const stateCode = p.state_code as string | undefined;
  const country = p.country as string | undefined;
  const countryCode = (p.country_code as string | undefined)?.toUpperCase();
  const formatted = p.formatted as string | undefined;

  if (!city) return (formatted ?? [state, country].filter(Boolean).join(', ')) ?? '';
  const useState = countryCode && SHOW_STATE.has(countryCode);
  if (useState && stateCode && state) return `${city}, ${stateCode} (${state})`;
  if (useState && state) return country ? `${city}, ${state}, ${country}` : `${city}, ${state}`;
  if (country) return `${city}, ${country}`;
  return formatted ?? [city, country].filter(Boolean).join(', ') ?? '';
}

function featuresToSuggestions(features: ApiFeature[]): PlaceSuggestion[] {
  const seen = new Set<string>();
  return features
    .map((f) => {
      const p = f.properties ?? {};
      const formatted = formatLabel(p);
      if (!formatted || seen.has(formatted)) return null;
      seen.add(formatted);
      return {
        formatted,
        city: p.city as string | undefined,
        state: p.state as string | undefined,
        stateCode: p.state_code as string | undefined,
        country: p.country as string | undefined,
        placeId: (p.place_id as string) ?? `${formatted}-${Math.random().toString(36).slice(2)}`,
        importance: (p.rank as { importance?: number })?.importance ?? 0,
      } as PlaceSuggestion;
    })
    .filter((s): s is PlaceSuggestion => s !== null);
}

async function fetchSuggestions(
  text: string,
  apiKeyVal: string,
  signal: AbortSignal | undefined,
  country?: string
): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({ text, apiKey: apiKeyVal, type: 'city', limit: country ? '12' : '15' });
  if (country) params.set('filter', `countrycode:${country}`);
  const res = await fetch(`${API_URL}?${params}`, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as ApiResponse;
  return featuresToSuggestions(data.features ?? []);
}

function getCached(q: string): PlaceSuggestion[] | null {
  const key = q.trim().toLowerCase();
  const ent = cache.get(key);
  if (!ent || Date.now() - ent.ts > CACHE_TTL_MS) {
    if (ent) cache.delete(key);
    return null;
  }
  return ent.list;
}

function setCached(q: string, list: PlaceSuggestion[]): void {
  const key = q.trim().toLowerCase();
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
  cache.set(key, { list, ts: Date.now() });
}

export async function fetchPlaceSuggestions(query: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  const key = apiKey();
  if (q.length < MIN_LEN || !key || key === 'your_geoapify_api_key') return [];

  try {
    const [global, us] = await Promise.all([
      fetchSuggestions(q, key, signal),
      fetchSuggestions(q, key, signal, 'us'),
    ]);
    const byFormatted = new Map<string, PlaceSuggestion>();
    for (const s of [...us, ...global]) {
      if (!byFormatted.has(s.formatted)) byFormatted.set(s.formatted, s);
    }
    const list = Array.from(byFormatted.values()).sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
    setCached(q, list);
    return list;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return [];
    return [];
  }
}

// Address autocomplete types and functions
export interface AddressSuggestion {
  formatted: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  placeId: string;
  lat?: number;
  lon?: number;
}

function formatAddressLabel(p: Record<string, unknown>): string {
  // Return the full formatted address from Geoapify
  return (p.formatted as string) ?? '';
}

function featuresToAddressSuggestions(features: ApiFeature[]): AddressSuggestion[] {
  const seen = new Set<string>();
  return features
    .map((f) => {
      const p = f.properties ?? {};
      const formatted = formatAddressLabel(p);
      if (!formatted || seen.has(formatted)) return null;
      seen.add(formatted);
      return {
        formatted,
        street: p.street as string | undefined,
        houseNumber: p.housenumber as string | undefined,
        city: p.city as string | undefined,
        state: p.state as string | undefined,
        postcode: p.postcode as string | undefined,
        country: p.country as string | undefined,
        placeId: (p.place_id as string) ?? `${formatted}-${Math.random().toString(36).slice(2)}`,
        lat: p.lat as number | undefined,
        lon: p.lon as number | undefined,
      } as AddressSuggestion;
    })
    .filter((s): s is AddressSuggestion => s !== null);
}

async function fetchAddressSuggestionsRaw(
  text: string,
  apiKeyVal: string,
  signal: AbortSignal | undefined
): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({ 
    text, 
    apiKey: apiKeyVal, 
    limit: '8',
    // Don't filter by type to get all address types (street, building, etc.)
  });
  const res = await fetch(`${API_URL}?${params}`, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as ApiResponse;
  return featuresToAddressSuggestions(data.features ?? []);
}

const addressCache = new Map<string, { list: AddressSuggestion[]; ts: number }>();

function getAddressCached(q: string): AddressSuggestion[] | null {
  const key = `addr:${q.trim().toLowerCase()}`;
  const ent = addressCache.get(key);
  if (!ent || Date.now() - ent.ts > CACHE_TTL_MS) {
    if (ent) addressCache.delete(key);
    return null;
  }
  return ent.list;
}

function setAddressCached(q: string, list: AddressSuggestion[]): void {
  const key = `addr:${q.trim().toLowerCase()}`;
  if (addressCache.size >= MAX_CACHE) addressCache.delete(addressCache.keys().next().value!);
  addressCache.set(key, { list, ts: Date.now() });
}

export async function fetchAddressSuggestions(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const q = query.trim();
  const key = apiKey();
  if (q.length < MIN_LEN || !key || key === 'your_geoapify_api_key') return [];

  const cached = getAddressCached(q);
  if (cached) return cached;

  try {
    const list = await fetchAddressSuggestionsRaw(q, key, signal);
    setAddressCached(q, list);
    return list;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return [];
    return [];
  }
}

export interface AddressAutocompleteService {
  debouncedFetchSuggestions: (query: string, onResult: (suggestions: AddressSuggestion[]) => void) => void;
  cancel: () => void;
}

export function createAddressAutocompleteService(): AddressAutocompleteService {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let abort: AbortController | null = null;

  return {
    debouncedFetchSuggestions(query: string, onResult: (suggestions: AddressSuggestion[]) => void): void {
      const q = query.trim();
      if (timer) clearTimeout(timer);
      timer = null;

      if (q.length < MIN_LEN) {
        onResult([]);
        return;
      }

      timer = setTimeout(async () => {
        timer = null;
        abort?.abort();
        const ac = new AbortController();
        abort = ac;

        const cached = getAddressCached(q);
        if (cached) onResult(cached);

        const list = await fetchAddressSuggestions(q, ac.signal);
        if (!ac.signal.aborted) onResult(list);
      }, DEBOUNCE_MS);
    },

    cancel(): void {
      if (timer) clearTimeout(timer);
      timer = null;
      abort?.abort();
      abort = null;
    },
  };
}
