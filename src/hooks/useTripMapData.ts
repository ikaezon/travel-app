import { useState, useEffect, useRef, useMemo } from 'react';
import { useTripById } from './useTrips';
import { useReservationsByTrip } from './useReservations';
import { getReservationDisplayAddress } from '../utils/reservationFormat';
import {
  geocodeAddresses,
  isGeocodingAvailable,
} from '../data/services/geocodingService';
import type { GeocodeResult } from '../data/services/geocodingService';


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


const MIN_DELTA = 0.02;
const SINGLE_DELTA = 0.05;
const PADDING_FACTOR = 1.4;

function computeRegion(markers: MapMarker[]): MapRegion | null {
  if (markers.length === 0) return null;

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

  const abortRef = useRef<AbortController | null>(null);

  const prevEntriesRef = useRef<typeof addressEntries | null>(null);

  const addressEntries = useMemo(() => {
    const entries: { address: string; id: string; title: string; isDestination: boolean }[] = [];
    const seen = new Set<string>();

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

  if (prevEntriesRef.current !== null && addressEntries !== prevEntriesRef.current) {
    if (addressEntries.length > 0 && isGeocodingAvailable()) {
      if (!isGeocoding) setIsGeocoding(true);
    }
  }
  prevEntriesRef.current = addressEntries;

  useEffect(() => {
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
