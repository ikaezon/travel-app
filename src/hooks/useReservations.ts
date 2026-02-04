import { useCallback } from 'react';
import { Reservation } from '../types';
import { reservationService } from '../data';
import { useAsyncData } from './useAsyncData';

interface UseReservationsResult {
  reservations: Reservation[];
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseReservationResult {
  reservation: Reservation | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useReservations(): UseReservationsResult {
  const fetchReservations = useCallback(() => reservationService.getAllReservations(), []);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchReservations, {
    initialData: [],
  });

  return { reservations: data, isLoading, isRefetching, error, refetch };
}

export function useReservationsByTrip(tripId: string): UseReservationsResult {
  const fetchReservations = useCallback(
    () => reservationService.getReservationsByTripId(tripId),
    [tripId]
  );
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchReservations, {
    initialData: [],
  });

  return { reservations: data, isLoading, isRefetching, error, refetch };
}

export function useReservationById(reservationId: string): UseReservationResult {
  const fetchReservation = useCallback(
    () => reservationService.getReservationById(reservationId),
    [reservationId]
  );
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchReservation, {
    initialData: null,
  });

  return { reservation: data, isLoading, isRefetching, error, refetch };
}

export function useReservationByTimelineId(timelineId: string): UseReservationResult {
  const fetchReservation = useCallback(
    () => reservationService.getReservationByTimelineId(timelineId),
    [timelineId]
  );
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchReservation, {
    initialData: null,
  });

  return { reservation: data, isLoading, isRefetching, error, refetch };
}
