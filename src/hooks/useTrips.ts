import { useCallback, useState, useRef, useEffect } from 'react';
import { Trip, TimelineItem, QuickAction } from '../types';
import { tripService } from '../data';
import { useAsyncData } from './useAsyncData';

interface UseTripsResult {
  trips: Trip[];
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseTripResult {
  trip: Trip | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseTimelineResult {
  timeline: TimelineItem[];
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseTimelineItemResult {
  timelineItem: TimelineItem | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseQuickActionsResult {
  quickActions: QuickAction[];
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTrips(): UseTripsResult {
  const fetchTrips = useCallback(() => tripService.getAllTrips(), []);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchTrips, {
    initialData: [],
  });

  return { trips: data, isLoading, isRefetching, error, refetch };
}

export function useUpcomingTrips(): UseTripsResult {
  const fetchTrips = useCallback(() => tripService.getUpcomingTrips(), []);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchTrips, {
    initialData: [],
  });

  return { trips: data, isLoading, isRefetching, error, refetch };
}

export function useTripById(tripId: string): UseTripResult {
  const fetchTrip = useCallback(() => tripService.getTripById(tripId), [tripId]);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchTrip, {
    initialData: null,
  });

  return { trip: data, isLoading, isRefetching, error, refetch };
}

export function useTripTimeline(tripId: string): UseTimelineResult {
  const fetchTimeline = useCallback(() => {
    if (!tripId) return Promise.resolve([] as TimelineItem[]);
    return tripService.getTripTimeline(tripId);
  }, [tripId]);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchTimeline, {
    initialData: [],
  });

  return { timeline: data, isLoading, isRefetching, error, refetch };
}

export function useTimelineItemById(timelineItemId: string): UseTimelineItemResult {
  const fetchTimelineItem = useCallback(() => {
    if (!timelineItemId) return Promise.resolve(null);
    return tripService.getTimelineItemById(timelineItemId);
  }, [timelineItemId]);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchTimelineItem, {
    initialData: null,
  });

  return { timelineItem: data, isLoading, isRefetching, error, refetch };
}

export function useQuickActions(): UseQuickActionsResult {
  const fetchActions = useCallback(() => tripService.getQuickActions(), []);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchActions, {
    initialData: [],
  });

  return { quickActions: data, isLoading, isRefetching, error, refetch };
}

interface UseCreateTripResult {
  createTrip: (data: Omit<Trip, 'id'>) => Promise<Trip>;
  isSubmitting: boolean;
}

export function useCreateTrip(): UseCreateTripResult {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTrip = useCallback(async (tripData: Omit<Trip, 'id'>) => {
    setIsSubmitting(true);
    try {
      const trip = await tripService.createTrip(tripData);
      return trip;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createTrip, isSubmitting };
}

interface UseDeleteTripOptions {
  onSuccess?: () => void;
}

interface UseDeleteTripResult {
  deleteTrip: (tripId: string) => Promise<void>;
  isDeleting: boolean;
}

export function useDeleteTrip(options?: UseDeleteTripOptions): UseDeleteTripResult {
  const onSuccessRef = useRef(options?.onSuccess);
  useEffect(() => {
    onSuccessRef.current = options?.onSuccess;
  }, [options?.onSuccess]);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteTrip = useCallback(async (tripId: string) => {
    setIsDeleting(true);
    try {
      await tripService.deleteTrip(tripId);
      onSuccessRef.current?.();
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteTrip, isDeleting };
}
