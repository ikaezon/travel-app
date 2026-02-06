import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { SplashScreen } from '../screens';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  onLoginSuccess: () => void;
}

export function AuthNavigator({ onLoginSuccess }: AuthNavigatorProps) {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.gradient.start },
      }}
    >
      <Stack.Screen name="Splash">
        {() => (
          <SplashScreen
            onEmailPress={onLoginSuccess}
            onApplePress={onLoginSuccess}
            onGooglePress={onLoginSuccess}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
