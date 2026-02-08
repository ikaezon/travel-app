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
import { KeyboardProvider } from 'react-native-keyboard-controller';
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

function useNativeThemeSync(
  isDark: boolean,
  isHydrated: boolean,
  onReady: () => void
): void {
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;

    const colors = getThemeColors(isDark);

    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(isDark ? 'dark' : 'light');
    }

    SystemUI.setBackgroundColorAsync(colors.gradient.start)
      .then(() => {
        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          onReady();
        }
      })
      .catch(() => {
        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          onReady();
        }
      });
  }, [isDark, isHydrated, onReady]);
}

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
      <KeyboardProvider>
        <SafeAreaProvider>
          <ThemeProvider onHydrated={handleThemeHydrated}>
            <AuthProvider>
              <ThemedNavigation onNativeReady={handleNativeReady} />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
