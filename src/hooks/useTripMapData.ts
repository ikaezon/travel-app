import { useState, useEffect, useRef, useMemo } from 'react';
import { useTripById } from './useTrips';
import { useReservationsByTrip } from './useReservations';
import { getReservationDisplayAddress } from '../utils/reservationFormat';
import {
  geocodeAddresses,
  isGeocodingAvailable,
} from '../data/services/geocodingService';
import type { GeocodeResult } from '../data/services/geocodingService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  /** True for the trip destination marker */
  isDestination: boolean;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface UseTripMapDataResult {
  region: MapRegion | null;
  markers: MapMarker[];
  isLoading: boolean;
  error: Error | null;
  /** Convenience flag — true when region and at least one marker exist */
  hasData: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MIN_DELTA = 0.02;
const SINGLE_DELTA = 0.05;
const PADDING_FACTOR = 1.4;

function computeRegion(markers: MapMarker[]): MapRegion | null {
  if (markers.length === 0) return null;

  // Always center on the destination (primary trip location) marker
  const destination = markers.find((m) => m.isDestination) ?? markers[0];

  return {
    latitude: destination.latitude,
    longitude: destination.longitude,
    latitudeDelta: SINGLE_DELTA,
    longitudeDelta: SINGLE_DELTA,
  };
}

/**
 * Normalize an address string for deduplication.
 */
function normalizeAddress(addr: string): string {
  return addr.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseTripMapDataOptions {
  /** When true, only the trip destination is shown (e.g. Paris). Used for the inline preview. */
  destinationOnly?: boolean;
}

/**
 * Provides map region and markers derived from a trip's destination
 * and its reservation addresses.
 *
 * Data flow:
 * 1. Fetch trip (for destination) and reservations (for addresses)
 * 2. Extract + deduplicate addresses (or only destination when destinationOnly)
 * 3. Geocode all addresses in parallel via Geoapify
 * 4. Build markers and compute a bounding region
 */
export function useTripMapData(
  tripId: string,
  options?: UseTripMapDataOptions,
): UseTripMapDataResult {
  const { destinationOnly = false } = options ?? {};
  const { trip, isLoading: tripLoading } = useTripById(tripId);
  const { reservations, isLoading: resLoading } = useReservationsByTrip(tripId);

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<Error | null>(null);

  // Track the abort controller so we can cancel on unmount or tripId change
  const abortRef = useRef<AbortController | null>(null);

  // Track previous addressEntries to detect changes synchronously during render
  // and set isGeocoding = true immediately — eliminates the one-render gap between
  // data loading and the geocoding useEffect firing.
  const prevEntriesRef = useRef<typeof addressEntries | null>(null);

  // Derive unique addresses: destination only (preview) or destination + reservations (expand)
  const addressEntries = useMemo(() => {
    const entries: { address: string; id: string; title: string; isDestination: boolean }[] = [];
    const seen = new Set<string>();

    // Trip destination (primary marker)
    if (trip?.destination) {
      const norm = normalizeAddress(trip.destination);
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        entries.push({
          address: trip.destination,
          id: `destination-${tripId}`,
          title: trip.destination,
          isDestination: true,
        });
      }
    }

    // Reservation addresses — skip when destinationOnly (preview shows only Paris/destination)
    if (!destinationOnly) {
      for (const res of reservations) {
        const addr = getReservationDisplayAddress(res);
        if (!addr) continue;
        const norm = normalizeAddress(addr);
        if (seen.has(norm)) continue;
        seen.add(norm);
        entries.push({
          address: addr,
          id: `res-${res.id}`,
          title: res.providerName || addr,
          isDestination: false,
        });
      }
    }

    return entries;
  }, [trip, reservations, tripId, destinationOnly]);

  // Synchronously mark geocoding as pending when addressEntries changes.
  // This eliminates the one-render gap where isLoading would be false
  // (data hooks finished) but isGeocoding hasn't been set to true yet
  // (effect hasn't fired). Without this, the MapView could mount with
  // stale markers during that gap.
  if (prevEntriesRef.current !== null && addressEntries !== prevEntriesRef.current) {
    if (addressEntries.length > 0 && isGeocodingAvailable()) {
      if (!isGeocoding) setIsGeocoding(true);
    }
  }
  prevEntriesRef.current = addressEntries;

  // Geocode when addresses change
  useEffect(() => {
    // Cancel previous geocoding
    abortRef.current?.abort();

    if (!isGeocodingAvailable() || addressEntries.length === 0) {
      setMarkers([]);
      setIsGeocoding(false);
      setGeocodeError(null);
      return;
    }

    const ac = new AbortController();
    abortRef.current = ac;
    setIsGeocoding(true);
    setGeocodeError(null);

    geocodeAddresses(
      addressEntries.map((e) => e.address),
      ac.signal,
    )
      .then((results) => {
        if (ac.signal.aborted) return;

        const newMarkers: MapMarker[] = [];
        for (let i = 0; i < results.length; i++) {
          const geo = results[i];
          if (!geo) continue;
          newMarkers.push({
            id: addressEntries[i].id,
            latitude: geo.lat,
            longitude: geo.lon,
            title: addressEntries[i].title,
            isDestination: addressEntries[i].isDestination,
          });
        }
        setMarkers(newMarkers);
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        setGeocodeError(
          err instanceof Error ? err : new Error('Geocoding failed'),
        );
      })
      .finally(() => {
        if (!ac.signal.aborted) setIsGeocoding(false);
      });

    return () => {
      ac.abort();
    };
  }, [addressEntries]);

  const region = useMemo(() => computeRegion(markers), [markers]);
  const isLoading = tripLoading || (!destinationOnly && resLoading) || isGeocoding;

  return {
    region,
    markers,
    isLoading,
    error: geocodeError,
    hasData: region !== null && markers.length > 0,
  };
}
