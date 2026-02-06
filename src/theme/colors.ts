export const colors = {
  primary: '#0ea5e9',
  primaryLight: 'rgba(14, 165, 233, 0.1)',
  primaryDark: '#0284c7',

  background: {
    light: '#f0f9ff',
    dark: '#0c4a6e',
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

  glass: {
    background: 'rgba(255, 255, 255, 0.55)',
    backgroundStrong: 'rgba(255, 255, 255, 0.65)',
    border: 'rgba(255, 255, 255, 0.65)',
    borderStrong: 'rgba(255, 255, 255, 0.85)',
    shadow: 'rgba(31, 38, 135, 0.07)',
    iconInset: 'rgba(255, 255, 255, 0.5)',
    progressBg: 'rgba(255, 255, 255, 0.3)',
  },

  gradient: {
    start: '#e2e8f0',
    middle: '#f1f5f9',
    end: '#cbd5e1',
  },

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

// ============================================
// RESOLVED COLORS (theme-aware, no .light/.dark)
// ============================================

export interface ResolvedColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  status: {
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;
  };
  reservation: {
    flight: { bg: string; icon: string };
    hotel: { bg: string; icon: string };
    train: { bg: string; icon: string };
    car: { bg: string; icon: string };
  };
  glass: {
    background: string;
    backgroundStrong: string;
    border: string;
    borderStrong: string;
    shadow: string;
    iconInset: string;
    progressBg: string;
  };
  gradient: {
    start: string;
    middle: string;
    end: string;
  };
  accent: {
    blue: string;
    indigo: string;
    purple: string;
    orange: string;
  };
  white: string;
  black: string;
  transparent: string;
}

export function getThemeColors(isDark: boolean): ResolvedColors {
  if (isDark) {
    return {
      // Obsidian Liquid Glass dark palette
      primary: colors.primary,
      primaryLight: 'rgba(14, 165, 233, 0.12)',
      primaryDark: colors.primaryDark,
      background: '#0f0f11',
      surface: '#252529',
      text: {
        primary: '#ffffff',
        secondary: '#a1a1aa',
        tertiary: '#71717a',
      },
      border: 'rgba(255, 255, 255, 0.12)',
      status: {
        success: '#34d399',
        successLight: 'rgba(52, 211, 153, 0.12)',
        warning: '#fbbf24',
        warningLight: 'rgba(251, 191, 36, 0.12)',
        error: '#f87171',
        errorLight: 'rgba(248, 113, 113, 0.12)',
        info: '#60a5fa',
        infoLight: 'rgba(96, 165, 250, 0.12)',
      },
      reservation: {
        flight: { bg: 'rgba(96, 165, 250, 0.10)', icon: '#60a5fa' },
        hotel: { bg: 'rgba(251, 146, 60, 0.10)', icon: '#fb923c' },
        train: { bg: 'rgba(52, 211, 153, 0.10)', icon: '#34d399' },
        car: { bg: 'rgba(168, 85, 247, 0.10)', icon: '#a855f7' },
      },
      glass: {
        background: 'rgba(80, 80, 85, 0.15)',
        backgroundStrong: 'rgba(40, 40, 45, 0.40)',
        border: 'rgba(255, 255, 255, 0.12)',
        borderStrong: 'rgba(255, 255, 255, 0.20)',
        shadow: 'rgba(0, 0, 0, 0.50)',
        iconInset: 'rgba(255, 255, 255, 0.05)',
        progressBg: 'rgba(39, 39, 42, 0.50)',
      },
      gradient: {
        start: '#18181b',
        middle: '#27272a',
        end: '#1c1c1e',
      },
      accent: {
        blue: '#60a5fa',
        indigo: '#818cf8',
        purple: '#a855f7',
        orange: '#fb923c',
      },
      white: colors.white,
      black: colors.black,
      transparent: colors.transparent,
    };
  }

  return {
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    background: colors.background.light,
    surface: colors.surface.light,
    text: {
      primary: colors.text.primary.light,
      secondary: colors.text.secondary.light,
      tertiary: colors.text.tertiary.light,
    },
    border: colors.border.light,
    status: colors.status,
    reservation: colors.reservation,
    glass: colors.glass,
    gradient: colors.gradient,
    accent: colors.accent,
    white: colors.white,
    black: colors.black,
    transparent: colors.transparent,
  };
}
