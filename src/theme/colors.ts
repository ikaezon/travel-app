export const colors = {
  primary: '#0ea5e9', // Sky 500
  primaryLight: 'rgba(14, 165, 233, 0.1)',
  primaryDark: '#0284c7', // Sky 600

  background: {
    light: '#f0f9ff', // Sky 50
    dark: '#0c4a6e', // Sky 900
  },

  surface: {
    light: '#ffffff',
    dark: '#1a262d',
  },

  text: {
    primary: {
      light: '#0f172a',
      dark: '#ffffff',
    },
    secondary: {
      light: '#64748b',
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
      icon: '#3b82f6',
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

  // Liquid glass - higher contrast: whiter cards, stronger borders
  glass: {
    background: 'rgba(255, 255, 255, 0.55)',
    backgroundStrong: 'rgba(255, 255, 255, 0.65)',
    border: 'rgba(255, 255, 255, 0.65)',
    borderStrong: 'rgba(255, 255, 255, 0.85)',
    shadow: 'rgba(31, 38, 135, 0.07)',
    iconInset: 'rgba(255, 255, 255, 0.5)',
    progressBg: 'rgba(255, 255, 255, 0.3)',
  },

  // Ambient gradient - slightly darker/greyer for better contrast with white cards
  gradient: {
    start: '#e2e8f0', // Slate 200
    middle: '#f1f5f9', // Slate 100
    end: '#cbd5e1',   // Slate 300
  },

  // Accent colors for variety
  accent: {
    blue: '#3b82f6',
    indigo: '#6366f1',
    purple: '#9333ea',
    orange: '#ea580c',
  },

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
