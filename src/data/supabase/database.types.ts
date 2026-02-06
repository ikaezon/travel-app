export type DbReservationType = 'flight' | 'hotel' | 'train' | 'car';
export type DbTripStatus = 'upcoming' | 'ongoing' | 'completed';
export type DbTripIconName = 'airplane-ticket' | 'hotel' | 'train';
export type DbReservationStatus = 'confirmed' | 'pending' | 'cancelled';

export interface DbUser {
  id: string;
  email: string;
  name: string;
  photo_url: string | null;
  title: string | null;
  member_since: string | null;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbTrip {
  id: string;
  user_id: string;
  destination: string;
  date_range: string;
  duration_label: string | null;
  image_url: string | null;
  status: DbTripStatus;
  icon_name: DbTripIconName;
  created_at: string;
  updated_at: string;
}

export interface DbTimelineItem {
  id: string;
  trip_id: string;
  reservation_id: string | null;
  type: DbReservationType;
  date: string;
  time: string;
  title: string;
  subtitle: string | null;
  metadata: string | null;
  action_label: string | null;
  action_icon: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbReservation {
  id: string;
  trip_id: string;
  type: DbReservationType;
  provider_name: string;
  operated_by: string | null;
  header_image_url: string | null;
  route: string;
  date: string;
  duration: string | null;
  status: DbReservationStatus;
  terminal: string | null;
  gate: string | null;
  seat: string | null;
  confirmation_code: string;
  status_text: string | null;
  vehicle_info: string | null;
  boarding_zone: string | null;
  priority: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAttachment {
  id: string;
  reservation_id: string;
  name: string;
  date: string | null;
  size: string | null;
  thumbnail_url: string | null;
  storage_path: string | null;
  created_at: string;
}

export interface DbUserSettings {
  user_id: string;
  dark_mode: boolean;
  notifications: boolean;
  updated_at: string;
}

export type DbTripInsert = Omit<DbTrip, 'id' | 'created_at' | 'updated_at'>;
export type DbTripUpdate = Partial<Omit<DbTrip, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type DbTimelineItemInsert = Omit<DbTimelineItem, 'id' | 'created_at' | 'updated_at'>;
export type DbTimelineItemUpdate = Partial<Omit<DbTimelineItem, 'id' | 'trip_id' | 'created_at' | 'updated_at'>>;

export type DbReservationInsert = Omit<DbReservation, 'id' | 'created_at' | 'updated_at'>;
export type DbReservationUpdate = Partial<Omit<DbReservation, 'id' | 'trip_id' | 'created_at' | 'updated_at'>>;

export type DbAttachmentInsert = Omit<DbAttachment, 'id' | 'created_at'>;

export type DbUserInsert = Omit<DbUser, 'created_at' | 'updated_at'>;
export type DbUserUpdate = Partial<Omit<DbUser, 'id' | 'created_at' | 'updated_at'>>;
