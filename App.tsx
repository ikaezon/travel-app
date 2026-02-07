import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

/**
 * Lives inside ThemeProvider so it can read isDark and build a
 * React Navigation theme whose native screen backgrounds match dark mode.
 * Without this, DefaultTheme's white background flashes during back-navigation
 * transitions before the React gradient content renders on top.
 */
function ThemedNavigation() {
  const { isDark, isHydrated, colors } = useTheme();

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

  // Don't render navigation until theme is hydrated to prevent
  // components from rendering with incorrect isDark state
  if (!isHydrated) {
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

  // Track when both fonts and theme are ready
  const appReady = fontsLoaded && themeHydrated;

  const handleThemeHydrated = useCallback(() => {
    setThemeHydrated(true);
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
            <ThemedNavigation />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
