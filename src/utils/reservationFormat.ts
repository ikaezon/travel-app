import { Reservation } from '../types';

/**
 * Formats the date display text for a reservation.
 * Handles different formatting rules for hotels vs other types.
 */
export function formatReservationDateDisplay(reservation: Reservation): string {
  const duration = reservation.duration?.trim() || '';
  const hasDuration = duration && duration !== '—' && duration !== '-';

  if (reservation.type === 'hotel') {
    if (duration.includes(' - ')) {
      return duration;
    }
    if (duration === reservation.date) {
      return reservation.date;
    }
    return hasDuration ? `${reservation.date} • ${duration}` : reservation.date;
  }

  return hasDuration ? `${reservation.date} • ${duration}` : reservation.date;
}

/**
 * Gets a display-friendly address, using route as fallback for hotels.
 */
export function getReservationDisplayAddress(reservation: Reservation): string | null {
  if (reservation.address) {
    return reservation.address;
  }
  if (reservation.type === 'hotel' && reservation.route) {
    return reservation.route;
  }
  return null;
}
