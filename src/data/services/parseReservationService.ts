import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { config } from '../../config';
import type { ParsedReservation } from '../../types';

const EXTRACTION_PROMPT = `You are extracting travel reservation data from a screenshot. The image may show a flight, hotel, or train confirmation.

Return ONLY valid JSON matching one of these shapes (no markdown, no explanation, no code fences):

For flight: {"type":"flight","airline":"...","flightNumber":"...","departureAirport":"...","arrivalAirport":"...","departureDate":"YYYY-MM-DD","departureTime":"HH:MM","confirmationCode":"..."}
For hotel: {"type":"hotel","propertyName":"...","address":"...","checkInDate":"YYYY-MM-DD","checkOutDate":"YYYY-MM-DD","confirmationCode":"..."}
For train: {"type":"train","operator":"...","trainNumber":"...","departureStation":"...","arrivalStation":"...","departureDate":"YYYY-MM-DD","departureTime":"HH:MM","confirmationCode":"..."}
If the image is unclear or not a reservation: {"type":"unknown","rawText":"brief description of what you see"}

Rules:
- Use empty string "" for any field you cannot determine.
- For airports, use IATA codes when possible (e.g. "LAX", "JFK").
- Dates must be ISO format YYYY-MM-DD.
- Times must be 24-hour format HH:MM.
- Return raw JSON only. No wrapping, no explanation.`;

async function readImageAsBase64(imageUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });
  return base64;
}

function getMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    if (firstNewline !== -1) {
      cleaned = cleaned.slice(firstNewline + 1);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();
  }
  return cleaned;
}

function validateParsedResult(raw: unknown): ParsedReservation {
  if (!raw || typeof raw !== 'object') {
    return { type: 'unknown', rawText: 'Invalid response from AI' };
  }

  const obj = raw as Record<string, unknown>;
  const type = obj.type;

  if (type === 'flight') {
    return {
      type: 'flight',
      airline: String(obj.airline ?? ''),
      flightNumber: String(obj.flightNumber ?? ''),
      departureAirport: String(obj.departureAirport ?? ''),
      arrivalAirport: String(obj.arrivalAirport ?? ''),
      departureDate: String(obj.departureDate ?? ''),
      departureTime: String(obj.departureTime ?? ''),
      confirmationCode: String(obj.confirmationCode ?? ''),
    };
  }

  if (type === 'hotel') {
    return {
      type: 'hotel',
      propertyName: String(obj.propertyName ?? ''),
      address: String(obj.address ?? ''),
      checkInDate: String(obj.checkInDate ?? ''),
      checkOutDate: String(obj.checkOutDate ?? ''),
      confirmationCode: String(obj.confirmationCode ?? ''),
    };
  }

  if (type === 'train') {
    return {
      type: 'train',
      operator: String(obj.operator ?? ''),
      trainNumber: String(obj.trainNumber ?? ''),
      departureStation: String(obj.departureStation ?? ''),
      arrivalStation: String(obj.arrivalStation ?? ''),
      departureDate: String(obj.departureDate ?? ''),
      departureTime: String(obj.departureTime ?? ''),
      confirmationCode: String(obj.confirmationCode ?? ''),
    };
  }

  return {
    type: 'unknown',
    rawText: String(obj.rawText ?? 'Could not identify reservation type'),
  };
}

export interface ParseReservationInput {
  uri?: string;
  base64?: string;
  mimeType?: string;
}

export async function parseReservationFromImage(
  input: string | ParseReservationInput
): Promise<ParsedReservation> {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    throw new Error(
      'Gemini API key not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.'
    );
  }

  let base64Data: string;
  let mimeType: string;

  if (typeof input === 'string') {
    base64Data = await readImageAsBase64(input);
    mimeType = getMimeType(input);
  } else if (input.base64) {
    base64Data = input.base64;
    mimeType = input.mimeType ?? getMimeType('.jpg');
  } else if (input.uri) {
    base64Data = await readImageAsBase64(input.uri);
    mimeType = input.mimeType ?? getMimeType(input.uri);
  } else {
    throw new Error('Provide either uri or base64 in the input.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    },
  ]);

  const response = result.response;
  const text = response.text();

  if (!text) {
    return { type: 'unknown', rawText: 'AI returned empty response' };
  }

  try {
    const cleaned = stripCodeFences(text);
    const parsed = JSON.parse(cleaned);
    return validateParsedResult(parsed);
  } catch {
    return { type: 'unknown', rawText: text.slice(0, 500) };
  }
}
