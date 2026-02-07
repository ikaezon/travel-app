import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import {
  TripListScreen,
  TripOverviewScreen,
  CreateTripScreen,
  MapExpandScreen,
  ReservationDetailScreen,
  EditReservationScreen,
  ReservationAttachmentsScreen,
  ScreenshotUploadScreen,
  ReviewDetailsScreen,
  ManualEntryOptionsScreen,
  FlightEntryScreen,
  LodgingEntryScreen,
  TrainEntryScreen,
} from '../screens';
import { MainTabNavigator } from './MainTabNavigator';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator<MainStackParamList>();

interface MainStackNavigatorProps {
  onSignOut: () => void;
}

export function MainStackNavigator({ onSignOut }: MainStackNavigatorProps) {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      id="MainStack"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.gradient.start },
      }}
    >
      <Stack.Screen name="Tabs">
        {() => <MainTabNavigator onSignOut={onSignOut} />}
      </Stack.Screen>
      <Stack.Screen name="TripList" component={TripListScreen} />
      <Stack.Screen name="TripOverview" component={TripOverviewScreen} />
      <Stack.Screen name="MapExpand" component={MapExpandScreen} />
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} />
      <Stack.Screen name="EditReservation" component={EditReservationScreen} />
      <Stack.Screen name="ReservationAttachments" component={ReservationAttachmentsScreen} />
      <Stack.Screen 
        name="ScreenshotUpload" 
        component={ScreenshotUploadScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="ReviewDetails" component={ReviewDetailsScreen} />
      <Stack.Screen name="ManualEntryOptions" component={ManualEntryOptionsScreen} />
      <Stack.Screen name="FlightEntry" component={FlightEntryScreen} />
      <Stack.Screen name="LodgingEntry" component={LodgingEntryScreen} />
      <Stack.Screen name="TrainEntry" component={TrainEntryScreen} />
    </Stack.Navigator>
  );
}
