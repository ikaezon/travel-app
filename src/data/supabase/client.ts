/**
 * Supabase client instance
 * Single source of truth for database connection
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../../config';

/**
 * Supabase client configured with environment variables
 * Uses anon key for client-side operations
 */
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);
