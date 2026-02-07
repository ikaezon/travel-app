import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance } from 'react-native';
import { getThemeColors, ResolvedColors } from '../theme/colors';
import { getResolvedGlass, ResolvedGlass } from '../theme/glassStyles';
import { userService } from '../data';

/** Initial isDark from system - avoids flash before storage loads */
function getInitialIsDark(): boolean {
  return Appearance.getColorScheme() === 'dark';
}

interface ThemeContextValue {
  isDark: boolean;
  isHydrated: boolean;
  colors: ResolvedColors;
  glass: ResolvedGlass;
  gradient: [string, string, string];
  blurTint: 'light' | 'dark';
  setDarkMode: (value: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  onHydrated?: () => void;
}

export function ThemeProvider({ children, onHydrated }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(getInitialIsDark);
  const [isHydrated, setIsHydrated] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      userService.getAppSettings().then((settings) => {
        setIsDark(Boolean(settings?.darkMode));
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
      setIsDark(!value);
    }
  }, []);

  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);
  const themeGlass = useMemo(() => getResolvedGlass(isDark), [isDark]);

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
      glass: themeGlass,
      gradient,
      blurTint,
      setDarkMode,
    }),
    [isDark, isHydrated, themeColors, themeGlass, gradient, blurTint, setDarkMode]
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
