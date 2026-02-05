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

  async getProfileUser(): Promise<User> {
    return this.getCurrentUser();
  },

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

  async getAppSettings(): Promise<AppSettings> {
    return mockSettings.appSettings as AppSettings;
  },

  async updateAppSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    return {
      ...mockSettings.appSettings,
      ...updates,
    } as AppSettings;
  },
};
