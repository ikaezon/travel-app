import { colors } from '../theme';
import type { Reservation } from '../types';

export interface ReservationStatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

export function getReservationStatusConfig(
  status: Reservation['status']
): ReservationStatusConfig {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', bgColor: colors.status.successLight, textColor: colors.status.success };
    case 'pending':
      return { label: 'Pending', bgColor: colors.status.warningLight, textColor: colors.status.warning };
    case 'cancelled':
      return { label: 'Cancelled', bgColor: colors.status.errorLight, textColor: colors.status.error };
    default:
      return { label: 'Unknown', bgColor: colors.border.light, textColor: colors.text.tertiary.light };
  }
}
