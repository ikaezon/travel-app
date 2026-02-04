import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainStackNavigator } from './MainStackNavigator';
import { useAuth } from '../contexts';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, signIn, signOut } = useAuth();

  return (
    <Stack.Navigator
      id="RootStack"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
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
