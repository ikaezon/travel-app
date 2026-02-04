import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { SplashScreen } from '../screens';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  onLoginSuccess: () => void;
}

export function AuthNavigator({ onLoginSuccess }: AuthNavigatorProps) {
  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
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
