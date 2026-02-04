/**
 * Data layer: services call Supabase and map DB ↔ domain types.
 * Services are pure async functions—no React, no navigation. This keeps the
 * layer ready for a future cache or offline sync without changing signatures.
 */
export * from './services';
export { supabase, TEST_USER_ID } from './supabase';
