/**
 * Database error handling
 * Custom error types for consistent error handling across services
 */

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

    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

/**
 * Maps PostgreSQL error codes to our error codes
 */
function mapPostgresErrorCode(pgCode: string): DatabaseErrorCode {
  switch (pgCode) {
    case '23505': // unique_violation
      return 'DUPLICATE';
    case '23503': // foreign_key_violation
    case '23502': // not_null_violation
    case '23514': // check_violation
      return 'CONSTRAINT_VIOLATION';
    case '42501': // insufficient_privilege
    case '42000': // syntax error or access rule violation
      return 'PERMISSION_DENIED';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Wraps a Supabase/Postgrest error into a DatabaseError
 * Only logs details in development mode
 */
export function wrapDatabaseError(
  error: PostgrestError | Error | unknown,
  context?: string
): DatabaseError {
  // Log in development only
  if (config.isDevelopment) {
    console.error('[DatabaseError]', context ?? '', error);
  }

  // Handle PostgrestError from Supabase
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    const code = mapPostgresErrorCode(pgError.code);
    
    // Don't leak internal details in production
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

  // Handle standard Error
  if (error instanceof Error) {
    const message = config.isDevelopment
      ? error.message
      : 'An unexpected error occurred';
    
    return new DatabaseError(message, 'UNKNOWN', error);
  }

  // Handle unknown error type
  return new DatabaseError('An unexpected error occurred', 'UNKNOWN');
}

/**
 * Returns generic user-facing error messages
 * Used in production to avoid leaking internal details
 */
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

/**
 * Helper to check if a Supabase response has an error
 */
export function hasError<T>(response: { data: T | null; error: PostgrestError | null }): response is { data: null; error: PostgrestError } {
  return response.error !== null;
}
