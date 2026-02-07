export type { ParsedReservation, ParsedFlightReservation, ParsedHotelReservation, ParsedTrainReservation, ParsedUnknownReservation } from './parsedReservation';
export type ReservationType = 'flight' | 'hotel' | 'train' | 'car';
export type TripIconType = 'airplane-ticket' | 'hotel' | 'train';

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  title: string;
  memberSince: string;
  isPro: boolean;
}

export interface Trip {
  id: string;
  destination: string;
  dateRange: string;
  durationLabel: string;
  imageUrl: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  iconName: 'airplane-ticket' | 'hotel' | 'train';
}

export interface TimelineItem {
  id: string;
  tripId: string;
  type: ReservationType;
  date: string;
  time: string;
  title: string;
  subtitle: string;
  metadata?: string;
  actionLabel: string;
  actionIcon: string;
  thumbnailUrl?: string;
}

export interface Reservation {
  id: string;
  tripId: string;
  type: ReservationType;
  providerName: string;
  operatedBy?: string;
  headerImageUrl: string;
  route: string;
  date: string;
  duration: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  terminal?: string;
  gate?: string;
  seat?: string;
  confirmationCode: string;
  statusText: string;
  vehicleInfo?: string;
  boardingZone?: string;
  priority?: string;
  address?: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  date: string;
  size: string;
  thumbnailUrl?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  iconKey: string;
  iconColor: string;
  iconBgColor: string;
  route: string;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  appVersion: string;
}
