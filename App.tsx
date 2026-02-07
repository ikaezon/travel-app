import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from '@expo-google-fonts/outfit/useFonts';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { getThemeColors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync();

/**
 * Synchronizes native iOS/Android root view background with React theme.
 * 
 * This solves the "white flash" during screen transitions in dark mode:
 * - Native stack navigator uses real native screen containers
 * - These containers have their own background color (separate from React views)
 * - During transitions, the native container is briefly visible
 * - expo-system-ui sets the native root view background to match our theme
 * 
 * This hook runs the sync effect and calls onReady when complete.
 * It also updates the background whenever isDark changes.
 */
function useNativeThemeSync(
  isDark: boolean,
  isHydrated: boolean,
  onReady: () => void
): void {
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;

    const colors = getThemeColors(isDark);

    // Sync native color scheme with app theme - prevents native elements
    // (GlassView, stack containers) from flashing wrong appearance during transitions
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(isDark ? 'dark' : 'light');
    }
    
    // Set native background color - this affects the UIWindow on iOS
    // and root View on Android, eliminating the white flash
    SystemUI.setBackgroundColorAsync(colors.gradient.start)
      .then(() => {
        // Only notify ready once (first time)
        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          onReady();
        }
      })
      .catch(() => {
        // Silently fail on unsupported platforms (web)
        // Still notify ready so the app doesn't hang
        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          onReady();
        }
      });
  }, [isDark, isHydrated, onReady]);
}

/**
 * Lives inside ThemeProvider so it can read isDark and build a
 * React Navigation theme whose native screen backgrounds match dark mode.
 * 
 * Signals readiness via onNativeReady callback when native background is set.
 */
interface ThemedNavigationProps {
  onNativeReady: () => void;
}

function ThemedNavigation({ onNativeReady }: ThemedNavigationProps) {
  const { isDark, isHydrated, colors } = useTheme();
  const [nativeReady, setNativeReady] = useState(false);

  const handleNativeReady = useCallback(() => {
    setNativeReady(true);
    onNativeReady();
  }, [onNativeReady]);

  useNativeThemeSync(isDark, isHydrated, handleNativeReady);

  const navigationTheme: Theme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.gradient.start,
        card: colors.gradient.start,
      },
    };
  }, [isDark, colors.gradient.start]);

  // Don't render navigation until:
  // 1. Theme is hydrated (we know if dark mode is enabled)
  // 2. Native background is set (prevents white flash on first screen)
  if (!isHydrated || !nativeReady) {
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  const [themeHydrated, setThemeHydrated] = useState(false);
  const [nativeReady, setNativeReady] = useState(false);

  // Track when all prerequisites are ready:
  // 1. Fonts loaded
  // 2. Theme hydrated from storage
  // 3. Native background color set (prevents white flash)
  const appReady = fontsLoaded && themeHydrated && nativeReady;

  const handleThemeHydrated = useCallback(() => {
    setThemeHydrated(true);
  }, []);

  const handleNativeReady = useCallback(() => {
    setNativeReady(true);
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider onHydrated={handleThemeHydrated}>
          <AuthProvider>
            <ThemedNavigation onNativeReady={handleNativeReady} />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
