import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainStackNavigator } from './MainStackNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, signIn, signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      id="RootStack"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.gradient.start },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth">
          {() => <AuthNavigator onLoginSuccess={signIn} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Main">
          {() => <MainStackNavigator onSignOut={signOut} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
