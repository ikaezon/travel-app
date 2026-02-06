import { PostgrestError } from '@supabase/supabase-js';
import { config } from '../../config';

export type DatabaseErrorCode =
  | 'UNKNOWN'
  | 'NOT_FOUND'
  | 'DUPLICATE'
  | 'CONSTRAINT_VIOLATION'
  | 'PERMISSION_DENIED'
  | 'CONNECTION_ERROR'
  | 'VALIDATION_ERROR';

export class DatabaseError extends Error {
  readonly code: DatabaseErrorCode;
  readonly originalError?: Error | PostgrestError;
  readonly details?: string;

  constructor(
    message: string,
    code: DatabaseErrorCode = 'UNKNOWN',
    originalError?: Error | PostgrestError,
    details?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.originalError = originalError;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

function mapPostgresErrorCode(pgCode: string): DatabaseErrorCode {
  switch (pgCode) {
    case '23505':
      return 'DUPLICATE';
    case '23503':
    case '23502':
    case '23514':
      return 'CONSTRAINT_VIOLATION';
    case '42501':
    case '42000':
      return 'PERMISSION_DENIED';
    default:
      return 'UNKNOWN';
  }
}

export function wrapDatabaseError(
  error: PostgrestError | Error | unknown,
  context?: string
): DatabaseError {
  if (config.isDevelopment) {
    console.error('[DatabaseError]', context ?? '', error);
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    const code = mapPostgresErrorCode(pgError.code);

    const message = config.isDevelopment
      ? pgError.message
      : getGenericErrorMessage(code);
    
    return new DatabaseError(
      message,
      code,
      pgError,
      config.isDevelopment ? pgError.details : undefined
    );
  }

  if (error instanceof Error) {
    const message = config.isDevelopment
      ? error.message
      : 'An unexpected error occurred';
    
    return new DatabaseError(message, 'UNKNOWN', error);
  }

  return new DatabaseError('An unexpected error occurred', 'UNKNOWN');
}

function getGenericErrorMessage(code: DatabaseErrorCode): string {
  switch (code) {
    case 'NOT_FOUND':
      return 'The requested resource was not found';
    case 'DUPLICATE':
      return 'A resource with this information already exists';
    case 'CONSTRAINT_VIOLATION':
      return 'The operation could not be completed due to data constraints';
    case 'PERMISSION_DENIED':
      return 'You do not have permission to perform this action';
    case 'CONNECTION_ERROR':
      return 'Unable to connect to the server. Please check your connection';
    case 'VALIDATION_ERROR':
      return 'The provided data is invalid';
    default:
      return 'An unexpected error occurred';
  }
}

export function hasError<T>(response: { data: T | null; error: PostgrestError | null }): response is { data: null; error: PostgrestError } {
  return response.error !== null;
}
