/**
 * Reservation Workflows
 *
 * High-level operations that coordinate multiple service calls.
 * These provide transaction-like behavior for operations that
 * span multiple tables (reservations + timeline_items).
 *
 * Note: True database transactions require a backend RPC function.
 * This layer orders operations to minimize inconsistent states.
 */

import { Reservation, ReservationType } from '../../types';
import { reservationService } from './reservationService';
import { tripService } from './tripService';

const DEFAULT_RESERVATION_HEADER_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';

export interface CreateFlightInput {
  tripId: string;
  airline: string;
  flightNumber?: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  confirmationNumber?: string;
}

export interface CreateLodgingInput {
  tripId: string;
  propertyName: string;
  address?: string;
  checkInDate: string;
  checkOutDate: string;
  confirmationNumber?: string;
}

export interface CreateTrainInput {
  tripId: string;
  operator: string;
  trainNumber?: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  confirmationNumber?: string;
}

/**
 * Creates a flight reservation and its associated timeline item.
 * Operations are ordered so that if the second fails, the data
 * is still usable (reservation exists, just not on timeline).
 */
export async function createFlightReservation(
  input: CreateFlightInput
): Promise<{ reservation: Reservation; timelineItemId: string }> {
  const {
    tripId,
    airline,
    flightNumber,
    departureAirport,
    arrivalAirport,
    departureDate,
    departureTime,
    confirmationNumber,
  } = input;

  const providerName = airline.trim() || 'Flight';
  const routeText =
    [departureAirport.trim(), arrivalAirport.trim()].filter(Boolean).join(' → ') || 'TBD';
  const title = [providerName, flightNumber?.trim()].filter(Boolean).join(' ') || 'Flight';

  // Create reservation first
  const reservation = await reservationService.createReservation({
    tripId,
    type: 'flight',
    providerName,
    route: routeText,
    date: departureDate.trim() || 'TBD',
    duration: '',
    status: 'confirmed',
    confirmationCode: confirmationNumber?.trim() || '—',
    statusText: 'On Time',
    headerImageUrl: DEFAULT_RESERVATION_HEADER_IMAGE,
    attachments: [],
  });

  // Create timeline item with link to reservation
  const timelineItem = await tripService.createTimelineItem(tripId, {
    type: 'flight',
    date: departureDate.trim() || 'TBD',
    time: departureTime.trim() || 'TBD',
    title,
    subtitle: routeText,
    metadata: confirmationNumber?.trim() ? `Conf: #${confirmationNumber.trim()}` : undefined,
    actionLabel: 'Boarding Pass',
    actionIcon: 'qr-code-scanner',
    reservationId: reservation.id,
  });

  return { reservation, timelineItemId: timelineItem.id };
}

/**
 * Creates a lodging reservation and its associated timeline item.
 */
export async function createLodgingReservation(
  input: CreateLodgingInput
): Promise<{ reservation: Reservation; timelineItemId: string }> {
  const {
    tripId,
    propertyName,
    address,
    checkInDate,
    checkOutDate,
    confirmationNumber,
  } = input;

  const providerName = propertyName.trim() || 'Hotel';
  const duration =
    checkInDate === checkOutDate
      ? checkInDate
      : `${checkInDate} - ${checkOutDate}`;

  const reservation = await reservationService.createReservation({
    tripId,
    type: 'hotel',
    providerName,
    route: providerName,
    date: checkInDate,
    duration,
    status: 'confirmed',
    confirmationCode: confirmationNumber?.trim() || '—',
    statusText: 'Confirmed',
    headerImageUrl: DEFAULT_RESERVATION_HEADER_IMAGE,
    address: address?.trim() || undefined,
    attachments: [],
  });

  const timelineItem = await tripService.createTimelineItem(tripId, {
    type: 'hotel',
    date: checkInDate,
    time: '15:00',
    title: providerName,
    subtitle: providerName,
    metadata: confirmationNumber?.trim() ? `Conf: #${confirmationNumber.trim()}` : undefined,
    actionLabel: 'Get Directions',
    actionIcon: 'directions',
    reservationId: reservation.id,
  });

  return { reservation, timelineItemId: timelineItem.id };
}

/**
 * Creates a train reservation and its associated timeline item.
 */
export async function createTrainReservation(
  input: CreateTrainInput
): Promise<{ reservation: Reservation; timelineItemId: string }> {
  const {
    tripId,
    operator,
    trainNumber,
    departureStation,
    arrivalStation,
    departureDate,
    departureTime,
    confirmationNumber,
  } = input;

  const providerName = operator.trim() || 'Train';
  const routeText =
    [departureStation.trim(), arrivalStation.trim()].filter(Boolean).join(' → ') || 'TBD';
  const title = [providerName, trainNumber?.trim()].filter(Boolean).join(' ') || 'Train';

  const reservation = await reservationService.createReservation({
    tripId,
    type: 'train',
    providerName,
    route: routeText,
    date: departureDate.trim() || 'TBD',
    duration: '',
    status: 'confirmed',
    confirmationCode: confirmationNumber?.trim() || '—',
    statusText: 'On Time',
    headerImageUrl: DEFAULT_RESERVATION_HEADER_IMAGE,
    attachments: [],
  });

  const timelineItem = await tripService.createTimelineItem(tripId, {
    type: 'train',
    date: departureDate.trim() || 'TBD',
    time: departureTime.trim() || 'TBD',
    title,
    subtitle: routeText,
    metadata: confirmationNumber?.trim() ? `Conf: #${confirmationNumber.trim()}` : undefined,
    actionLabel: 'View Ticket',
    actionIcon: 'qr-code',
    reservationId: reservation.id,
  });

  return { reservation, timelineItemId: timelineItem.id };
}

/**
 * Deletes a reservation and its associated timeline item.
 * Timeline item is deleted first since it's the "view" layer.
 * If timeline deletion fails, reservation remains intact (recoverable).
 */
export async function deleteReservationWithTimeline(
  reservationId: string,
  timelineItemId: string
): Promise<void> {
  // Delete timeline item first (the view layer)
  await tripService.deleteTimelineItem(timelineItemId);

  // Then delete the reservation
  await reservationService.deleteReservation(reservationId);
}
