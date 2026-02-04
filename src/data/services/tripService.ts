import { Trip, TimelineItem, QuickAction } from '../../types';
import { mockQuickActions } from '../mocks';
import {
  supabase,
  TEST_USER_ID,
  mapTripFromDb,
  mapTripToDb,
  mapTripUpdateToDb,
  mapTimelineItemFromDb,
  mapTimelineItemToDb,
  DbTrip,
  DbTimelineItem,
} from '../supabase';
import { DatabaseError, wrapDatabaseError, hasError } from '../supabase/errors';

export const tripService = {
  /**
   * Get all trips for the current user
   */
  async getAllTrips(): Promise<Trip[]> {
    const response = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false });

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'getAllTrips');
    }

    return (response.data as DbTrip[]).map(mapTripFromDb);
  },

  /**
   * Get upcoming and ongoing trips (not completed)
   */
  async getUpcomingTrips(): Promise<Trip[]> {
    const response = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'getUpcomingTrips');
    }

    return (response.data as DbTrip[]).map(mapTripFromDb);
  },

  /**
   * Get completed trips
   */
  async getCompletedTrips(): Promise<Trip[]> {
    const response = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'getCompletedTrips');
    }

    return (response.data as DbTrip[]).map(mapTripFromDb);
  },

  /**
   * Get a single trip by ID
   */
  async getTripById(tripId: string): Promise<Trip | null> {
    const response = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', TEST_USER_ID)
      .single();

    if (response.error) {
      // PGRST116 = no rows returned, which is not an error for this method
      if (response.error.code === 'PGRST116') {
        return null;
      }
      throw wrapDatabaseError(response.error, 'getTripById');
    }

    return mapTripFromDb(response.data as DbTrip);
  },

  /**
   * Get timeline items for a trip
   */
  async getTripTimeline(tripId: string): Promise<TimelineItem[]> {
    const response = await supabase
      .from('timeline_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'getTripTimeline');
    }

    return (response.data as DbTimelineItem[]).map(mapTimelineItemFromDb);
  },

  /**
   * Create a timeline item for a trip (e.g. when adding a reservation)
   */
  async createTimelineItem(
    tripId: string,
    item: Omit<TimelineItem, 'id' | 'tripId'>
  ): Promise<TimelineItem> {
    const dbData = mapTimelineItemToDb({ ...item, tripId });

    const response = await supabase
      .from('timeline_items')
      .insert(dbData)
      .select()
      .single();

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'createTimelineItem');
    }

    return mapTimelineItemFromDb(response.data as DbTimelineItem);
  },

  /**
   * Delete a single timeline item
   */
  async deleteTimelineItem(timelineItemId: string): Promise<boolean> {
    const response = await supabase
      .from('timeline_items')
      .delete()
      .eq('id', timelineItemId);

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'deleteTimelineItem');
    }

    return true;
  },

  /**
   * Get quick actions (static UI config, kept in mocks)
   */
  async getQuickActions(): Promise<QuickAction[]> {
    return mockQuickActions.quickActions as QuickAction[];
  },

  /**
   * Create a new trip
   */
  async createTrip(tripData: Omit<Trip, 'id'>): Promise<Trip> {
    const dbData = mapTripToDb(tripData, TEST_USER_ID);

    const response = await supabase
      .from('trips')
      .insert(dbData)
      .select()
      .single();

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'createTrip');
    }

    return mapTripFromDb(response.data as DbTrip);
  },

  /**
   * Update an existing trip
   */
  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
    const dbUpdates = mapTripUpdateToDb(updates);

    const response = await supabase
      .from('trips')
      .update(dbUpdates)
      .eq('id', tripId)
      .eq('user_id', TEST_USER_ID)
      .select()
      .single();

    if (response.error) {
      // PGRST116 = no rows returned (trip not found)
      if (response.error.code === 'PGRST116') {
        return null;
      }
      throw wrapDatabaseError(response.error, 'updateTrip');
    }

    return mapTripFromDb(response.data as DbTrip);
  },

  /**
   * Delete a trip and all related data (attachments, reservations, timeline items)
   */
  async deleteTrip(tripId: string): Promise<boolean> {
    const reservationsResponse = await supabase
      .from('reservations')
      .select('id')
      .eq('trip_id', tripId);
    if (reservationsResponse.error) {
      throw wrapDatabaseError(reservationsResponse.error, 'deleteTrip:reservations');
    }
    const reservationIds = (reservationsResponse.data ?? []).map((r) => r.id);
    if (reservationIds.length > 0) {
      const attResponse = await supabase
        .from('attachments')
        .delete()
        .in('reservation_id', reservationIds);
      if (attResponse.error) {
        throw wrapDatabaseError(attResponse.error, 'deleteTrip:attachments');
      }
    }
    const resResponse = await supabase.from('reservations').delete().eq('trip_id', tripId);
    if (resResponse.error) {
      throw wrapDatabaseError(resResponse.error, 'deleteTrip:reservations');
    }
    const timelineResponse = await supabase
      .from('timeline_items')
      .delete()
      .eq('trip_id', tripId);
    if (timelineResponse.error) {
      throw wrapDatabaseError(timelineResponse.error, 'deleteTrip:timeline_items');
    }
    const response = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', TEST_USER_ID);
    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'deleteTrip');
    }
    return true;
  },
};
