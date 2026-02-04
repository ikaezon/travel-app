import { Reservation, Attachment } from '../../types';
import {
  supabase,
  mapReservationFromDb,
  mapReservationToDb,
  mapReservationUpdateToDb,
  mapAttachmentFromDb,
  DbReservation,
  DbAttachment,
  DbTimelineItem,
  ATTACHMENTS_BUCKET,
} from '../supabase';
import { wrapDatabaseError, hasError } from '../supabase/errors';

// Feature flag for fallback behavior when timeline item has no exact match
const ENABLE_RESERVATION_FALLBACK = true;

/**
 * Helper to fetch attachments for a reservation
 */
async function fetchAttachments(reservationId: string): Promise<Attachment[]> {
  const response = await supabase
    .from('attachments')
    .select('*')
    .eq('reservation_id', reservationId);

  if (hasError(response)) {
    throw wrapDatabaseError(response.error, 'fetchAttachments');
  }

  return (response.data as DbAttachment[]).map(mapAttachmentFromDb);
}

/**
 * Helper to fetch attachments for multiple reservations
 */
async function fetchAttachmentsForReservations(
  reservationIds: string[]
): Promise<Map<string, Attachment[]>> {
  if (reservationIds.length === 0) {
    return new Map();
  }

  const response = await supabase
    .from('attachments')
    .select('*')
    .in('reservation_id', reservationIds);

  if (hasError(response)) {
    throw wrapDatabaseError(response.error, 'fetchAttachmentsForReservations');
  }

  // Group attachments by reservation_id
  const attachmentMap = new Map<string, Attachment[]>();
  for (const row of response.data as DbAttachment[]) {
    const attachments = attachmentMap.get(row.reservation_id) || [];
    attachments.push(mapAttachmentFromDb(row));
    attachmentMap.set(row.reservation_id, attachments);
  }

  return attachmentMap;
}

export const reservationService = {
  /**
   * Get all reservations (with attachments).
   * Note: Currently returns all rows from the reservations table with no user or trip filtering.
   * When auth and RLS are enabled, scope by user/trip in the query or via RLS policies.
   */
  async getAllReservations(): Promise<Reservation[]> {
    const response = await supabase
      .from('reservations')
      .select('*')
      .order('date', { ascending: true });

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'getAllReservations');
    }

    const reservations = response.data as DbReservation[];
    const reservationIds = reservations.map(r => r.id);
    const attachmentMap = await fetchAttachmentsForReservations(reservationIds);

    return reservations.map(row =>
      mapReservationFromDb(row, attachmentMap.get(row.id) || [])
    );
  },

  /**
   * Get reservations for a specific trip (with attachments)
   */
  async getReservationsByTripId(tripId: string): Promise<Reservation[]> {
    const response = await supabase
      .from('reservations')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: true });

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'getReservationsByTripId');
    }

    const reservations = response.data as DbReservation[];
    const reservationIds = reservations.map(r => r.id);
    const attachmentMap = await fetchAttachmentsForReservations(reservationIds);

    return reservations.map(row =>
      mapReservationFromDb(row, attachmentMap.get(row.id) || [])
    );
  },

  /**
   * Get a single reservation by ID (with attachments)
   */
  async getReservationById(reservationId: string): Promise<Reservation | null> {
    const response = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (response.error) {
      if (response.error.code === 'PGRST116') {
        return null;
      }
      throw wrapDatabaseError(response.error, 'getReservationById');
    }

    const attachments = await fetchAttachments(reservationId);
    return mapReservationFromDb(response.data as DbReservation, attachments);
  },

  /**
   * Get reservation associated with a timeline item
   * Matches by trip_id and type
   */
  async getReservationByTimelineId(timelineId: string): Promise<Reservation | null> {
    // First, get the timeline item to find trip_id and type
    const timelineResponse = await supabase
      .from('timeline_items')
      .select('*')
      .eq('id', timelineId)
      .single();

    if (timelineResponse.error) {
      if (timelineResponse.error.code === 'PGRST116') {
        return null;
      }
      throw wrapDatabaseError(timelineResponse.error, 'getReservationByTimelineId:timeline');
    }

    const timelineItem = timelineResponse.data as DbTimelineItem;

    // Find reservation matching trip_id and type
    const reservationResponse = await supabase
      .from('reservations')
      .select('*')
      .eq('trip_id', timelineItem.trip_id)
      .eq('type', timelineItem.type)
      .limit(1)
      .single();

    if (reservationResponse.error) {
      // No exact match found
      if (reservationResponse.error.code === 'PGRST116') {
        // Fallback: return first reservation for this trip if enabled
        if (ENABLE_RESERVATION_FALLBACK) {
          const fallbackResponse = await supabase
            .from('reservations')
            .select('*')
            .eq('trip_id', timelineItem.trip_id)
            .limit(1)
            .single();

          if (fallbackResponse.error) {
            return null;
          }

          const attachments = await fetchAttachments(fallbackResponse.data.id);
          return mapReservationFromDb(fallbackResponse.data as DbReservation, attachments);
        }
        return null;
      }
      throw wrapDatabaseError(reservationResponse.error, 'getReservationByTimelineId:reservation');
    }

    const attachments = await fetchAttachments(reservationResponse.data.id);
    return mapReservationFromDb(reservationResponse.data as DbReservation, attachments);
  },

  /**
   * Create a new reservation
   * Note: attachments should be created separately after the reservation
   */
  async createReservation(
    reservationData: Omit<Reservation, 'id'>
  ): Promise<Reservation> {
    // Extract attachments (they're created separately)
    const { attachments: _, tripId, ...restData } = reservationData;
    const dbData = mapReservationToDb(restData as Omit<Reservation, 'id' | 'attachments'>, tripId);

    const response = await supabase
      .from('reservations')
      .insert(dbData)
      .select()
      .single();

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'createReservation');
    }

    // Return with empty attachments (they can be added separately)
    return mapReservationFromDb(response.data as DbReservation, []);
  },

  /**
   * Update an existing reservation
   */
  async updateReservation(
    reservationId: string,
    updates: Partial<Reservation>
  ): Promise<Reservation | null> {
    // Remove attachments from updates (they're managed separately)
    const { attachments: _, ...restUpdates } = updates;
    const dbUpdates = mapReservationUpdateToDb(restUpdates);

    const response = await supabase
      .from('reservations')
      .update(dbUpdates)
      .eq('id', reservationId)
      .select()
      .single();

    if (response.error) {
      if (response.error.code === 'PGRST116') {
        return null;
      }
      throw wrapDatabaseError(response.error, 'updateReservation');
    }

    const attachments = await fetchAttachments(reservationId);
    return mapReservationFromDb(response.data as DbReservation, attachments);
  },

  /**
   * Delete a reservation (attachments are cascade deleted by FK)
   */
  async deleteReservation(reservationId: string): Promise<boolean> {
    const response = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservationId);

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'deleteReservation');
    }

    return true;
  },

  /**
   * Upload a file to Storage and create an attachment row for a reservation.
   * Requires a public bucket named "attachments" in Supabase Storage.
   */
  async createAttachmentFromFile(
    reservationId: string,
    fileUri: string,
    options?: { name?: string }
  ): Promise<Attachment> {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const ext = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg';
    const path = `${reservationId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

    const uploadResponse = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(path, blob, { contentType: blob.type || 'image/jpeg' });

    if (uploadResponse.error) {
      throw wrapDatabaseError(uploadResponse.error, 'createAttachmentFromFile:upload');
    }

    const { data: urlData } = supabase.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const insertRow = {
      reservation_id: reservationId,
      name: options?.name ?? 'Attachment',
      date: new Date().toISOString(),
      size: null as string | null,
      thumbnail_url: publicUrl,
      storage_path: path,
    };

    const insertResponse = await supabase
      .from('attachments')
      .insert(insertRow)
      .select()
      .single();

    if (hasError(insertResponse)) {
      throw wrapDatabaseError(insertResponse.error, 'createAttachmentFromFile:insert');
    }

    return mapAttachmentFromDb(insertResponse.data as DbAttachment);
  },
};
