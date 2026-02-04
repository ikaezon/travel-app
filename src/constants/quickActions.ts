import type { MainStackParamList } from '../navigation/types';

/**
 * Stack routes that quick actions on the dashboard are allowed to navigate to.
 * Mock data (data/mocks/quickActions.json) should only use "route" values from this array.
 */
export const QUICK_ACTION_ROUTES: (keyof MainStackParamList)[] = [
  'ManualEntryOptions',
  'ScreenshotUpload',
  'CreateTrip',
];
