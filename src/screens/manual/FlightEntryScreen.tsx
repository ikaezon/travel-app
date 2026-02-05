import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { TimePickerInput } from '../../components/ui/TimePickerInput';
import { DualAirportInput } from '../../components/ui/DualAirportInput';
import { TripSelector } from '../../components/domain';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import {
  colors,
  spacing,
  fontFamilies,
  glassStyles,
  glassColors,
} from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { reservationService, tripService } from '../../data';
import { DEFAULT_RESERVATION_HEADER_IMAGE } from '../../constants/reservationDefaults';
import { useTrips } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'FlightEntry'>;
type FlightEntryRouteProp = RouteProp<MainStackParamList, 'FlightEntry'>;

export default function FlightEntryScreen() {
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const dateFieldYRef = useRef(0);

  const topOffset = insets.top + 8;

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
      await reservationService.createReservation({
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

  const handleBackPress = () => navigation.goBack();

  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: topOffset + 72,
              paddingBottom: spacing.xxl + keyboardHeight,
            },
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
          <View onLayout={handleDateFieldLayout}>
            <DatePickerInput
              label="Departure date"
              value={departureDate}
              onChange={setDepartureDate}
              placeholder="Tap to select date"
              iconName="event"
              onOpen={handleCalendarOpen}
              bottomPadding={spacing.xxl + keyboardHeight}
              variant="glass"
            />
          </View>
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
        </ScrollView>

        <View style={[styles.headerContainer, { top: topOffset }]}>
          <BlurView intensity={24} tint="light" style={[styles.headerBlur, glassStyles.blurContentLarge]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.headerContent}>
              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                onPress={handleBackPress}
                accessibilityLabel="Go back"
              >
                <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
              </Pressable>
              <Text style={styles.headerTitle}>Flight Details</Text>
              <View style={styles.headerSpacer} />
            </View>
          </BlurView>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  headerBlur: {
    ...glassStyles.navBarWrapper,
    width: '90%',
    maxWidth: 340,
    position: 'relative',
    height: 56,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
});
