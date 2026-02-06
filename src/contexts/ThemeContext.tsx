import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getThemeColors, ResolvedColors } from '../theme/colors';
import { getGlassColors, getGlassShadows, ResolvedGlassColors, ResolvedGlassShadows } from '../theme/glassStyles';
import { userService } from '../data';

interface ThemeContextValue {
  isDark: boolean;
  isHydrated: boolean;
  colors: ResolvedColors;
  glassColors: ResolvedGlassColors;
  glassShadows: ResolvedGlassShadows;
  gradient: [string, string, string];
  blurTint: 'light' | 'dark';
  setDarkMode: (value: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Called when theme has been loaded from storage (used to avoid flash before splash hides) */
  onHydrated?: () => void;
}

export function ThemeProvider({ children, onHydrated }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const initializedRef = useRef(false);

  // Load initial dark mode preference from persisted settings
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      userService.getAppSettings().then((settings) => {
        if (settings?.darkMode) {
          setIsDark(true);
        }
        setIsHydrated(true);
        onHydrated?.();
      }).catch(() => {
        setIsHydrated(true);
        onHydrated?.();
      });
    }
  }, [onHydrated]);

  const setDarkMode = useCallback(async (value: boolean) => {
    setIsDark(value);
    try {
      await userService.updateAppSettings({ darkMode: value });
    } catch {
      // Revert on failure
      setIsDark(!value);
    }
  }, []);

  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);
  const themeGlassColors = useMemo(() => getGlassColors(isDark), [isDark]);
  const themeGlassShadows = useMemo(() => getGlassShadows(isDark), [isDark]);

  const gradient = useMemo<[string, string, string]>(
    () => [themeColors.gradient.start, themeColors.gradient.middle, themeColors.gradient.end],
    [themeColors]
  );

  const blurTint: 'light' | 'dark' = isDark ? 'dark' : 'light';

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark,
      isHydrated,
      colors: themeColors,
      glassColors: themeGlassColors,
      glassShadows: themeGlassShadows,
      gradient,
      blurTint,
      setDarkMode,
    }),
    [isDark, isHydrated, themeColors, themeGlassColors, themeGlassShadows, gradient, blurTint, setDarkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
