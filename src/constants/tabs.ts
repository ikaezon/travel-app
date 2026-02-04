export type TabIconName = 'home' | 'person';

export const TAB_CONFIG: Record<string, { icon: TabIconName; label: string }> = {
  Home: { icon: 'home', label: 'Home' },
  Profile: { icon: 'person', label: 'Profile' },
};
