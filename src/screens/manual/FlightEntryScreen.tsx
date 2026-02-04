import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { TripSelector } from '../../components/domain';
import { colors, spacing, borderRadius } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { reservationService, tripService } from '../../data';
import { DEFAULT_RESERVATION_HEADER_IMAGE } from '../../constants/reservationDefaults';
import { useTrips } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'FlightEntry'>;
type FlightEntryRouteProp = RouteProp<MainStackParamList, 'FlightEntry'>;

export default function FlightEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FlightEntryRouteProp>();
  const initialTripId = route.params?.tripId ?? null;
  const { trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(initialTripId);

  const [airline, setAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const dateFieldYRef = useRef(0);

  const handleCalendarOpen = useCallback(() => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, dateFieldYRef.current - 100),
      animated: true,
    });
  }, []);

  const handleDateFieldLayout = useCallback(
    (e: { nativeEvent: { layout: { y: number } } }) => {
      dateFieldYRef.current = e.nativeEvent.layout.y;
    },
    []
  );

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!selectedTripId) {
      Alert.alert('Select a trip', 'Choose a trip above to add this flight to.');
      return;
    }

    const providerName = airline.trim() || 'Flight';
    const routeText = [departureAirport.trim(), arrivalAirport.trim()].filter(Boolean).join(' → ') || 'TBD';
    const date = departureDate.trim() || 'TBD';
    const time = departureTime.trim() || 'TBD';
    const title = [providerName, flightNumber.trim()].filter(Boolean).join(' ') || 'Flight';
    const subtitle = routeText;

    setIsSubmitting(true);
    try {
      const reservation = await reservationService.createReservation({
        tripId: selectedTripId,
        type: 'flight',
        providerName,
        route: routeText,
        date,
        duration: '',
        status: 'confirmed',
        confirmationCode: confirmationNumber.trim() || '—',
        statusText: 'On Time',
        headerImageUrl: DEFAULT_RESERVATION_HEADER_IMAGE,
        attachments: [],
      });

      await tripService.createTimelineItem(selectedTripId, {
        type: 'flight',
        date,
        time,
        title,
        subtitle,
        metadata: confirmationNumber.trim() ? `Conf: #${confirmationNumber.trim()}` : undefined,
        actionLabel: 'Boarding Pass',
        actionIcon: 'qr-code-scanner',
      });

      setIsSubmitting(false);
      navigation.goBack();
    } catch (err) {
      setIsSubmitting(false);
      const message = err instanceof Error ? err.message : 'Could not save flight. Try again.';
      Alert.alert('Error', message, [{ text: 'OK' }]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
        </Pressable>
        <Text style={styles.title}>Flight Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxl + keyboardHeight },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
          <TripSelector
            trips={trips}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
            isLoading={tripsLoading}
            error={tripsError}
          />
          <FormInput
            label="Airline"
            value={airline}
            onChangeText={setAirline}
            placeholder="e.g. United, Delta"
            iconName="flight"
          />
          <FormInput
            label="Flight number"
            value={flightNumber}
            onChangeText={setFlightNumber}
            placeholder="e.g. UA 123"
            iconName="confirmation-number"
          />
          <FormInput
            label="Departure airport"
            value={departureAirport}
            onChangeText={setDepartureAirport}
            placeholder="e.g. SFO"
            iconName="flight-takeoff"
          />
          <FormInput
            label="Arrival airport"
            value={arrivalAirport}
            onChangeText={setArrivalAirport}
            placeholder="e.g. JFK"
            iconName="flight-land"
          />
          <View onLayout={handleDateFieldLayout}>
            <DatePickerInput
              label="Departure date"
              value={departureDate}
              onChange={setDepartureDate}
              placeholder="Tap to select date"
              iconName="event"
              onOpen={handleCalendarOpen}
              bottomPadding={spacing.xxl + keyboardHeight}
            />
          </View>
          <FormInput
            label="Departure time"
            value={departureTime}
            onChangeText={setDepartureTime}
            placeholder="e.g. 10:30 AM"
            iconName="schedule"
          />
          <FormInput
            label="Confirmation number"
            value={confirmationNumber}
            onChangeText={setConfirmationNumber}
            placeholder="Booking reference"
            iconName="badge"
          />

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              (pressed || isSubmitting) && styles.saveButtonPressed,
              !selectedTripId && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSubmitting || !selectedTripId}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Flight</Text>
            )}
          </Pressable>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  saveButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary.light,
    opacity: 0.8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
