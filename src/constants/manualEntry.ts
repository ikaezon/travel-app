import { colors } from '../theme';

export type ManualEntryRoute = 'FlightEntry' | 'LodgingEntry';

export interface ManualEntryOption {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'flight' | 'hotel';
  iconColor: string;
  iconBgColor: string;
  route: ManualEntryRoute;
}

export const MANUAL_ENTRY_OPTIONS: readonly ManualEntryOption[] = [
  {
    id: 'flight',
    title: 'Flight',
    subtitle: 'Add flight details',
    iconName: 'flight',
    iconColor: colors.reservation.flight.icon,
    iconBgColor: colors.reservation.flight.bg,
    route: 'FlightEntry',
  },
  {
    id: 'lodging',
    title: 'Lodging',
    subtitle: 'Add hotel or stay details',
    iconName: 'hotel',
    iconColor: colors.reservation.hotel.icon,
    iconBgColor: colors.reservation.hotel.bg,
    route: 'LodgingEntry',
  },
];
