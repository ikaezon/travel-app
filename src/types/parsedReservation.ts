/**
 * Discriminated union for AI-parsed reservation data.
 *
 * Returned by parseReservationService after Gemini Vision
 * processes a screenshot. The `type` field determines which
 * form the ReviewDetailsScreen renders.
 */

export interface ParsedFlightReservation {
  type: 'flight';
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  confirmationCode: string;
}

export interface ParsedHotelReservation {
  type: 'hotel';
  propertyName: string;
  address: string;
  checkInDate: string;
  checkOutDate: string;
  confirmationCode: string;
}

export interface ParsedTrainReservation {
  type: 'train';
  operator: string;
  trainNumber: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  confirmationCode: string;
}

export interface ParsedUnknownReservation {
  type: 'unknown';
  rawText: string;
}

export type ParsedReservation =
  | ParsedFlightReservation
  | ParsedHotelReservation
  | ParsedTrainReservation
  | ParsedUnknownReservation;
