/**
 * Supabase constants
 * Centralized constants for database operations
 */

/**
 * Test user ID for development without authentication
 * This user was seeded in the database
 * Replace with auth.uid() when Supabase Auth is implemented
 */
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Storage bucket for reservation attachments.
 * Create a public bucket named "attachments" in Supabase Dashboard if needed.
 */
export const ATTACHMENTS_BUCKET = 'attachments';
