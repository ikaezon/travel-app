import { User, AppSettings } from '../../types';
import { mockSettings } from '../mocks';
import {
  supabase,
  TEST_USER_ID,
  mapUserFromDb,
  mapUserToDb,
  DbUser,
} from '../supabase';
import { wrapDatabaseError, hasError } from '../supabase/errors';

export const userService = {
  /**
   * Get the current logged-in user
   * Uses TEST_USER_ID until Supabase Auth is implemented
   */
  async getCurrentUser(): Promise<User> {
    const response = await supabase
      .from('users')
      .select('*')
      .eq('id', TEST_USER_ID)
      .single();

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'getCurrentUser');
    }

    return mapUserFromDb(response.data as DbUser);
  },

  /**
   * Get the profile user (same as current user for now)
   * When multi-user profiles are needed, this can be different
   */
  async getProfileUser(): Promise<User> {
    return this.getCurrentUser();
  },

  /**
   * Get a user by their ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const response = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (response.error) {
      if (response.error.code === 'PGRST116') {
        return null;
      }
      throw wrapDatabaseError(response.error, 'getUserById');
    }

    return mapUserFromDb(response.data as DbUser);
  },

  /**
   * Update a user's profile
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const dbUpdates = mapUserToDb(updates);

    const response = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (hasError(response)) {
      throw wrapDatabaseError(response.error, 'updateUser');
    }

    return mapUserFromDb(response.data as DbUser);
  },

  /**
   * Get app settings
   * Kept local (mock) as these are device-specific preferences
   * Could be moved to user_settings table if cloud sync is needed
   */
  async getAppSettings(): Promise<AppSettings> {
    return mockSettings.appSettings as AppSettings;
  },

  /**
   * Update app settings
   * Kept local (mock) as these are device-specific preferences
   */
  async updateAppSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    return {
      ...mockSettings.appSettings,
      ...updates,
    } as AppSettings;
  },
};
