import type { User, Trip, TimelineItem, Reservation, Attachment } from '../../types';
import type {
  DbUser,
  DbTrip,
  DbTimelineItem,
  DbReservation,
  DbAttachment,
  DbTripInsert,
  DbTripUpdate,
  DbTimelineItemInsert,
  DbTimelineItemUpdate,
  DbReservationInsert,
  DbReservationUpdate,
  DbAttachmentInsert,
  DbUserUpdate,
} from './database.types';
import { formatTimeTo12Hour } from '../../utils/dateFormat';

export function mapUserFromDb(row: DbUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    photoUrl: row.photo_url ?? '',
    title: row.title ?? '',
    memberSince: row.member_since ?? '',
    isPro: row.is_pro,
  };
}

export function mapUserToDb(user: Partial<User>): DbUserUpdate {
  const mapped: DbUserUpdate = {};
  
  if (user.name !== undefined) mapped.name = user.name;
  if (user.email !== undefined) mapped.email = user.email;
  if (user.photoUrl !== undefined) mapped.photo_url = user.photoUrl;
  if (user.title !== undefined) mapped.title = user.title;
  if (user.memberSince !== undefined) mapped.member_since = user.memberSince;
  if (user.isPro !== undefined) mapped.is_pro = user.isPro;
  
  return mapped;
}

export function mapTripFromDb(row: DbTrip): Trip {
  return {
    id: row.id,
    destination: row.destination,
    dateRange: row.date_range,
    durationLabel: row.duration_label ?? '',
    imageUrl: row.image_url ?? '',
    status: row.status,
    iconName: row.icon_name,
  };
}

export function mapTripToDb(trip: Omit<Trip, 'id'>, userId: string): DbTripInsert {
  return {
    user_id: userId,
    destination: trip.destination,
    date_range: trip.dateRange,
    duration_label: trip.durationLabel || null,
    image_url: trip.imageUrl || null,
    status: trip.status,
    icon_name: trip.iconName,
  };
}

export function mapTripUpdateToDb(updates: Partial<Trip>): DbTripUpdate {
  const mapped: DbTripUpdate = {};
  
  if (updates.destination !== undefined) mapped.destination = updates.destination;
  if (updates.dateRange !== undefined) mapped.date_range = updates.dateRange;
  if (updates.durationLabel !== undefined) mapped.duration_label = updates.durationLabel || null;
  if (updates.imageUrl !== undefined) mapped.image_url = updates.imageUrl || null;
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.iconName !== undefined) mapped.icon_name = updates.iconName;
  
  return mapped;
}

export function mapTimelineItemFromDb(row: DbTimelineItem): TimelineItem {
  return {
    id: row.id,
    tripId: row.trip_id,
    type: row.type,
    date: row.date,
    time: formatTimeTo12Hour(row.time),
    title: row.title,
    subtitle: row.subtitle ?? '',
    metadata: row.metadata ?? undefined,
    actionLabel: row.action_label ?? '',
    actionIcon: row.action_icon ?? '',
    thumbnailUrl: row.thumbnail_url ?? undefined,
  };
}

export function mapTimelineItemToDb(
  item: Omit<TimelineItem, 'id'> & { reservationId?: string }
): DbTimelineItemInsert {
  return {
    trip_id: item.tripId,
    reservation_id: item.reservationId || null,
    type: item.type,
    date: item.date,
    time: item.time,
    title: item.title,
    subtitle: item.subtitle || null,
    metadata: item.metadata || null,
    action_label: item.actionLabel || null,
    action_icon: item.actionIcon || null,
    thumbnail_url: item.thumbnailUrl || null,
  };
}

export function mapTimelineItemUpdateToDb(
  updates: Partial<TimelineItem> & { reservationId?: string }
): DbTimelineItemUpdate {
  const mapped: DbTimelineItemUpdate = {};
  if (updates.reservationId !== undefined) mapped.reservation_id = updates.reservationId || null;
  if (updates.type !== undefined) mapped.type = updates.type;
  if (updates.date !== undefined) mapped.date = updates.date;
  if (updates.time !== undefined) mapped.time = updates.time;
  if (updates.title !== undefined) mapped.title = updates.title;
  if (updates.subtitle !== undefined) mapped.subtitle = updates.subtitle || null;
  if (updates.metadata !== undefined) mapped.metadata = updates.metadata || null;
  if (updates.actionLabel !== undefined) mapped.action_label = updates.actionLabel || null;
  if (updates.actionIcon !== undefined) mapped.action_icon = updates.actionIcon || null;
  if (updates.thumbnailUrl !== undefined) mapped.thumbnail_url = updates.thumbnailUrl || null;
  return mapped;
}

export function mapAttachmentFromDb(row: DbAttachment): Attachment {
  return {
    id: row.id,
    name: row.name,
    date: row.date ?? '',
    size: row.size ?? '',
    thumbnailUrl: row.thumbnail_url ?? undefined,
  };
}

export function mapAttachmentToDb(attachment: Omit<Attachment, 'id'>, reservationId: string): DbAttachmentInsert {
  return {
    reservation_id: reservationId,
    name: attachment.name,
    date: attachment.date || null,
    size: attachment.size || null,
    thumbnail_url: attachment.thumbnailUrl || null,
    storage_path: null,
  };
}

export function mapReservationFromDb(row: DbReservation, attachments: Attachment[] = []): Reservation {
  return {
    id: row.id,
    tripId: row.trip_id,
    type: row.type,
    providerName: row.provider_name,
    operatedBy: row.operated_by ?? undefined,
    headerImageUrl: row.header_image_url ?? '',
    route: row.route,
    date: row.date,
    duration: row.duration ?? '',
    status: row.status,
    terminal: row.terminal ?? undefined,
    gate: row.gate ?? undefined,
    seat: row.seat ?? undefined,
    confirmationCode: row.confirmation_code,
    statusText: row.status_text ?? '',
    vehicleInfo: row.vehicle_info ?? undefined,
    boardingZone: row.boarding_zone ?? undefined,
    priority: row.priority ?? undefined,
    address: row.address ?? undefined,
    attachments,
  };
}

export function mapReservationToDb(reservation: Omit<Reservation, 'id' | 'attachments'>, tripId: string): DbReservationInsert {
  return {
    trip_id: tripId,
    type: reservation.type,
    provider_name: reservation.providerName,
    operated_by: reservation.operatedBy || null,
    header_image_url: reservation.headerImageUrl || null,
    route: reservation.route,
    date: reservation.date,
    duration: reservation.duration || null,
    status: reservation.status,
    terminal: reservation.terminal || null,
    gate: reservation.gate || null,
    seat: reservation.seat || null,
    confirmation_code: reservation.confirmationCode,
    status_text: reservation.statusText || null,
    vehicle_info: reservation.vehicleInfo || null,
    boarding_zone: reservation.boardingZone || null,
    priority: reservation.priority || null,
    address: reservation.address || null,
  };
}

export function mapReservationUpdateToDb(updates: Partial<Reservation>): DbReservationUpdate {
  const mapped: DbReservationUpdate = {};
  
  if (updates.type !== undefined) mapped.type = updates.type;
  if (updates.providerName !== undefined) mapped.provider_name = updates.providerName;
  if (updates.operatedBy !== undefined) mapped.operated_by = updates.operatedBy || null;
  if (updates.headerImageUrl !== undefined) mapped.header_image_url = updates.headerImageUrl || null;
  if (updates.route !== undefined) mapped.route = updates.route;
  if (updates.date !== undefined) mapped.date = updates.date;
  if (updates.duration !== undefined) mapped.duration = updates.duration || null;
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.terminal !== undefined) mapped.terminal = updates.terminal || null;
  if (updates.gate !== undefined) mapped.gate = updates.gate || null;
  if (updates.seat !== undefined) mapped.seat = updates.seat || null;
  if (updates.confirmationCode !== undefined) mapped.confirmation_code = updates.confirmationCode;
  if (updates.statusText !== undefined) mapped.status_text = updates.statusText || null;
  if (updates.vehicleInfo !== undefined) mapped.vehicle_info = updates.vehicleInfo || null;
  if (updates.boardingZone !== undefined) mapped.boarding_zone = updates.boardingZone || null;
  if (updates.priority !== undefined) mapped.priority = updates.priority || null;
  if (updates.address !== undefined) mapped.address = updates.address || null;
  
  return mapped;
}
