import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { TripDashboardScreen, ProfileScreen } from '../screens';
import { TabBar } from '../components/navigation/TabBar';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabNavigatorProps {
  onSignOut: () => void;
}

export function MainTabNavigator({ onSignOut }: MainTabNavigatorProps) {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      id="MainTabs"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.gradient.start },
      }}
    >
      <Tab.Screen name="Home" component={TripDashboardScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen onLogOutPress={onSignOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
