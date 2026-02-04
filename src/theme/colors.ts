export const colors = {
  primary: '#13a4ec',
  primaryLight: 'rgba(19, 164, 236, 0.1)',
  primaryDark: '#0f8bc7',

  background: {
    light: '#f6f7f8',
    dark: '#101c22',
  },

  surface: {
    light: '#ffffff',
    dark: '#1a262d',
  },

  text: {
    primary: {
      light: '#111618',
      dark: '#ffffff',
    },
    secondary: {
      light: '#617c89',
      dark: '#94a3b8',
    },
    tertiary: {
      light: '#9ca3af',
      dark: '#6b7280',
    },
  },

  border: {
    light: '#e5e7eb',
    dark: '#374151',
  },

  status: {
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',
  },

  reservation: {
    flight: {
      bg: '#dbeafe',
      icon: '#13a4ec',
    },
    hotel: {
      bg: '#fed7aa',
      icon: '#ea580c',
    },
    train: {
      bg: '#d1fae5',
      icon: '#059669',
    },
    car: {
      bg: '#e9d5ff',
      icon: '#9333ea',
    },
  },

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
