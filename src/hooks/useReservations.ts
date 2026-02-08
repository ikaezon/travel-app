import { useCallback, useState } from 'react';
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

interface UseUpdateReservationResult {
  updateReservation: (
    reservationId: string,
    updates: Partial<Omit<Reservation, 'id' | 'tripId' | 'type'>>
  ) => Promise<Reservation>;
  isUpdating: boolean;
  error: Error | null;
}

export function useUpdateReservation(): UseUpdateReservationResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateReservation = useCallback(
    async (
      reservationId: string,
      updates: Partial<Omit<Reservation, 'id' | 'tripId' | 'type'>>
    ) => {
      setIsUpdating(true);
      setError(null);
      try {
        const result = await reservationService.updateReservation(reservationId, updates);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update reservation');
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateReservation, isUpdating, error };
}

interface UseCreateAttachmentResult {
  createAttachment: (
    reservationId: string,
    fileUri: string,
    fileName?: string
  ) => Promise<void>;
  isCreating: boolean;
  error: Error | null;
}

export function useCreateAttachment(): UseCreateAttachmentResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAttachment = useCallback(
    async (reservationId: string, fileUri: string, fileName?: string) => {
      setIsCreating(true);
      setError(null);
      try {
        await reservationService.createAttachmentFromFile(reservationId, fileUri, { name: fileName });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create attachment');
        setError(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createAttachment, isCreating, error };
}
