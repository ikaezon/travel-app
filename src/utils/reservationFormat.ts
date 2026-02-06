import { Reservation } from '../types';

/**
 * Formats the date display text for a reservation.
 * Handles different formatting rules for hotels vs other types.
 */
export function formatReservationDateDisplay(reservation: Reservation): string {
  const duration = reservation.duration?.trim() || '';
  const hasDuration = duration && duration !== '—' && duration !== '-';

  if (reservation.type === 'hotel') {
    // For hotels, duration contains the date range (e.g., "Jan 15 - Jan 18")
    if (duration.includes(' - ')) {
      return duration;
    }
    // If duration equals date, just show date once
    if (duration === reservation.date) {
      return reservation.date;
    }
    // Otherwise combine date and duration
    return hasDuration ? `${reservation.date} • ${duration}` : reservation.date;
  }

  // For flights, trains, etc: show date with duration if available
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
