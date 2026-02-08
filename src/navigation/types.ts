import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import type { ParsedReservation } from '../types';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
  Splash: undefined;
};

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  TripList: undefined;
  TripOverview: { tripId: string; tripName?: string };
  CreateTrip: undefined;
  ReservationDetail: { timelineItemId: string };
  EditReservation: { timelineItemId: string };
  ReservationAttachments: { timelineItemId: string };
  ScreenshotUpload: undefined;
  ReviewDetails: { imageUri: string; parsedData?: ParsedReservation; base64?: string };
  ManualEntryOptions: undefined;
  FlightEntry: { tripId?: string };
  LodgingEntry: { tripId?: string };
  TrainEntry: { tripId: string };
  MapExpand: { tripId: string; tripName?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<MainStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    MainStackScreenProps<keyof MainStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
