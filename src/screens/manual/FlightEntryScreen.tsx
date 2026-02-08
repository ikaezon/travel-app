import React, { useState, useCallback } from 'react';
import {
  View,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { TimePickerInput } from '../../components/ui/TimePickerInput';
import { DualAirportInput } from '../../components/ui/DualAirportInput';
import { TripSelector } from '../../components/domain/TripSelector';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { KeyboardAwareScrollView } from '../../components/ui/KeyboardAwareScrollView';
import { spacing, glassStyles } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { createFlightReservation } from '../../data';
import { useTrips } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'FlightEntry'>;
type FlightEntryRouteProp = RouteProp<MainStackParamList, 'FlightEntry'>;

export default function FlightEntryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FlightEntryRouteProp>();
  const insets = useSafeAreaInsets();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!selectedTripId) {
      Alert.alert('Select a trip', 'Choose a trip above to add this flight to.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createFlightReservation({
        tripId: selectedTripId,
        airline,
        flightNumber,
        departureAirport,
        arrivalAirport,
        departureDate,
        departureTime,
        confirmationNumber,
      });

      navigation.goBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save flight. Try again.';
      Alert.alert('Error', message, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);
  const topOffset = insets.top + 8;

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={glassStyles.screenGradient}
    >
      <View style={glassStyles.screenContainer}>
        <KeyboardAwareScrollView
          style={glassStyles.screenScrollView}
          contentContainerStyle={[
            glassStyles.screenScrollContent,
            {
              paddingTop: topOffset + 72,
              paddingBottom: spacing.xxl,
            },
          ]}
        >
          <TripSelector
            trips={trips}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
            isLoading={tripsLoading}
            error={tripsError}
            variant="glass"
          />
          <FormInput
            label="Airline"
            value={airline}
            onChangeText={setAirline}
            placeholder="e.g. United, Delta"
            iconName="flight"
            variant="glass"
          />
          <FormInput
            label="Flight number"
            value={flightNumber}
            onChangeText={setFlightNumber}
            placeholder="e.g. UA 123"
            iconName="confirmation-number"
            variant="glass"
          />
          <DualAirportInput
            departureValue={departureAirport}
            arrivalValue={arrivalAirport}
            onDepartureChange={setDepartureAirport}
            onArrivalChange={setArrivalAirport}
            departurePlaceholder="SFO"
            arrivalPlaceholder="JFK"
          />
          <DatePickerInput
            label="Departure date"
            value={departureDate}
            onChange={setDepartureDate}
            placeholder="Tap to select date"
            iconName="event"
            variant="glass"
          />
          <TimePickerInput
            label="Departure time"
            value={departureTime}
            onChange={setDepartureTime}
            placeholder="Tap to select time"
            iconName="schedule"
            variant="glass"
          />
          <FormInput
            label="Confirmation number"
            value={confirmationNumber}
            onChangeText={setConfirmationNumber}
            placeholder="Booking reference"
            iconName="badge"
            variant="glass"
          />

          <ShimmerButton
            label="Save Flight"
            iconName="flight"
            onPress={handleSave}
            disabled={isSubmitting || !selectedTripId}
            loading={isSubmitting}
            variant="boardingPass"
          />
        </KeyboardAwareScrollView>

        <GlassNavHeader
          title="Flight Details"
          onBackPress={handleBackPress}
        />
      </View>
    </LinearGradient>
  );
}

