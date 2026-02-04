import { useCallback } from 'react';
import { User, AppSettings } from '../types';
import { userService } from '../data';
import { useAsyncData } from './useAsyncData';

interface UseUserResult {
  user: User | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseAppSettingsResult {
  settings: AppSettings | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

export function useCurrentUser(): UseUserResult {
  const fetchUser = useCallback(() => userService.getCurrentUser(), []);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchUser, {
    initialData: null,
  });

  return { user: data, isLoading, isRefetching, error, refetch };
}

export function useProfileUser(): UseUserResult {
  const fetchUser = useCallback(() => userService.getProfileUser(), []);
  const { data, isLoading, isRefetching, error, refetch } = useAsyncData(fetchUser, {
    initialData: null,
  });

  return { user: data, isLoading, isRefetching, error, refetch };
}

export function useAppSettings(): UseAppSettingsResult {
  const fetchSettings = useCallback(() => userService.getAppSettings(), []);
  const { data, isLoading, isRefetching, error, setData } = useAsyncData(fetchSettings, {
    initialData: null,
  });

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    try {
      const updated = await userService.updateAppSettings(updates);
      setData(updated);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update settings');
    }
  }, [setData]);

  return { settings: data, isLoading, isRefetching, error, updateSettings };
}
