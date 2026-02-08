import { Reservation, ReservationType } from '../../types';
import { reservationService } from './reservationService';
import { tripService } from './tripService';



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
    headerImageUrl: '',
    attachments: [],
  });

  const timelineItem = await tripService.createTimelineItem(tripId, {
    type: 'flight',
    date: departureDate.trim() || 'TBD',
    time: departureTime.trim() || 'TBD',
    title,
    subtitle: routeText,
    metadata: confirmationNumber?.trim() ? `Conf: #${confirmationNumber.trim()}` : 'Conf: -',
    actionLabel: 'Boarding Pass',
    actionIcon: 'qr-code-scanner',
    reservationId: reservation.id,
  });

  return { reservation, timelineItemId: timelineItem.id };
}

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
    headerImageUrl: '',
    address: address?.trim() || undefined,
    attachments: [],
  });

  const timelineItem = await tripService.createTimelineItem(tripId, {
    type: 'hotel',
    date: checkInDate,
    time: '15:00',
    title: providerName,
    subtitle: providerName,
    metadata: confirmationNumber?.trim() ? `Conf: #${confirmationNumber.trim()}` : 'Conf: —',
    actionLabel: 'Get Directions',
    actionIcon: 'directions',
    reservationId: reservation.id,
  });

  return { reservation, timelineItemId: timelineItem.id };
}

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
    headerImageUrl: '',
    attachments: [],
  });

  const timelineItem = await tripService.createTimelineItem(tripId, {
    type: 'train',
    date: departureDate.trim() || 'TBD',
    time: departureTime.trim() || 'TBD',
    title,
    subtitle: routeText,
    metadata: confirmationNumber?.trim() ? `Conf: #${confirmationNumber.trim()}` : 'Conf: —',
    actionLabel: 'View Ticket',
    actionIcon: 'qr-code',
    reservationId: reservation.id,
  });

  return { reservation, timelineItemId: timelineItem.id };
}

export async function deleteReservationWithTimeline(
  reservationId: string,
  timelineItemId: string
): Promise<void> {
  await tripService.deleteTimelineItem(timelineItemId);

  await reservationService.deleteReservation(reservationId);
}
