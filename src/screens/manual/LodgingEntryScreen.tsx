import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { AddressAutocomplete } from '../../components/ui/AddressAutocomplete';
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
import { TripSelector } from '../../components/domain/TripSelector';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { colors, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { createLodgingReservation } from '../../data';
import { formatCalendarDateToLongDisplay } from '../../utils/dateFormat';
import { useTrips, useKeyboardHeight } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'LodgingEntry'>;
type LodgingEntryRouteProp = RouteProp<MainStackParamList, 'LodgingEntry'>;

export default function LodgingEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LodgingEntryRouteProp>();
  const insets = useSafeAreaInsets();
  const initialTripId = route.params?.tripId ?? null;
  const { trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(initialTripId);

  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
  const keyboardHeight = useKeyboardHeight();
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

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setCheckInDate(start);
    setCheckOutDate(end);
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!selectedTripId) {
      Alert.alert('Select a trip', 'Choose a trip above to add this lodging to.');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      Alert.alert('Select dates', 'Please select check-in and check-out dates.');
      return;
    }

    const checkInDisplay = formatCalendarDateToLongDisplay(checkInDate);
    const checkOutDisplay = formatCalendarDateToLongDisplay(checkOutDate);

    setIsSubmitting(true);
    try {
      await createLodgingReservation({
        tripId: selectedTripId,
        propertyName,
        address,
        checkInDate: checkInDisplay,
        checkOutDate: checkOutDisplay,
        confirmationNumber,
      });

      navigation.goBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save lodging. Try again.';
      Alert.alert('Error', message, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

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
            label="Property name"
            value={propertyName}
            onChangeText={setPropertyName}
            placeholder="e.g. Hilton Downtown"
            iconName="hotel"
            variant="glass"
          />
          <AddressAutocomplete
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Search for an address..."
            variant="glass"
          />
          <View onLayout={handleDateFieldLayout}>
            <DateRangePickerInput
              label="Check-in / Check-out dates"
              startDate={checkInDate}
              endDate={checkOutDate}
              onRangeChange={handleDateRangeChange}
              placeholder="Tap to select dates"
              onOpen={handleCalendarOpen}
              variant="glass"
            />
          </View>
          <FormInput
            label="Confirmation number"
            value={confirmationNumber}
            onChangeText={setConfirmationNumber}
            placeholder="Booking reference"
            iconName="badge"
            variant="glass"
          />
          <FormInput
            label="Room details"
            value={roomDetails}
            onChangeText={setRoomDetails}
            placeholder="e.g. King room, 2 guests"
            iconName="bed"
            variant="glass"
          />

          <ShimmerButton
            label="Save Lodging"
            iconName="hotel"
            onPress={handleSave}
            disabled={isSubmitting || !selectedTripId}
            loading={isSubmitting}
            variant="boardingPass"
          />
        </ScrollView>

        <GlassNavHeader
          title="Lodging Details"
          onBackPress={handleBackPress}
        />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
});
