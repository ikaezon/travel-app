import { Reservation } from '../types';

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

export function getReservationDisplayAddress(reservation: Reservation): string | null {
  if (reservation.address) {
    return reservation.address;
  }
  if (reservation.type === 'hotel' && reservation.route) {
    return reservation.route;
  }
  return null;
}
