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
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
import { TripSelector } from '../../components/domain';
import { colors, spacing, borderRadius } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { reservationService, tripService } from '../../data';
import {
  DEFAULT_RESERVATION_HEADER_IMAGE,
  DEFAULT_LODGING_CHECK_IN_TIME,
  DEFAULT_LODGING_CHECK_OUT_TIME,
} from '../../constants/reservationDefaults';
import { formatCalendarDateToLongDisplay } from '../../utils/dateFormat';
import { useTrips } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'LodgingEntry'>;
type LodgingEntryRouteProp = RouteProp<MainStackParamList, 'LodgingEntry'>;

export default function LodgingEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LodgingEntryRouteProp>();
  const initialTripId = route.params?.tripId ?? null;
  const { trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(initialTripId);

  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
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

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setCheckInDate(start);
    setCheckOutDate(end);
  };

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
      Alert.alert('Select a trip', 'Choose a trip above to add this lodging to.');
      return;
    }

    const dateDisplay = checkInDate ? formatCalendarDateToLongDisplay(checkInDate) : 'TBD';
    const dateRangeDisplay =
      checkInDate && checkOutDate
        ? checkInDate === checkOutDate
          ? formatCalendarDateToLongDisplay(checkInDate)
          : `${formatCalendarDateToLongDisplay(checkInDate)} - ${formatCalendarDateToLongDisplay(checkOutDate)}`
        : 'TBD';
    const title = propertyName.trim() || 'Hotel';
    const subtitle = roomDetails.trim()
      ? `Check-in ${DEFAULT_LODGING_CHECK_IN_TIME} • ${roomDetails}`
      : `Check-in ${DEFAULT_LODGING_CHECK_IN_TIME}`;
    const metadata = `Check-out ${DEFAULT_LODGING_CHECK_OUT_TIME}`;

    setIsSubmitting(true);
    try {
      await reservationService.createReservation({
        tripId: selectedTripId,
        type: 'hotel',
        providerName: title,
        route: address.trim() || 'TBD',
        date: dateRangeDisplay,
        duration: roomDetails.trim() || '—',
        status: 'confirmed',
        confirmationCode: confirmationNumber.trim() || '—',
        statusText: 'Confirmed',
        headerImageUrl: DEFAULT_RESERVATION_HEADER_IMAGE,
        attachments: [],
      });

      await tripService.createTimelineItem(selectedTripId, {
        type: 'hotel',
        date: dateDisplay,
        time: DEFAULT_LODGING_CHECK_IN_TIME,
        title,
        subtitle,
        metadata,
        actionLabel: 'Get Directions',
        actionIcon: 'directions',
      });

      setIsSubmitting(false);
      navigation.goBack();
    } catch (err) {
      setIsSubmitting(false);
      const message = err instanceof Error ? err.message : 'Could not save lodging. Try again.';
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
        <Text style={styles.title}>Lodging Details</Text>
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
            label="Property name"
            value={propertyName}
            onChangeText={setPropertyName}
            placeholder="e.g. Hilton Downtown"
            iconName="hotel"
          />
          <FormInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Street, city, country"
            iconName="location-on"
          />
          <View onLayout={handleDateFieldLayout}>
            <DateRangePickerInput
              label="Check-in / Check-out dates"
              startDate={checkInDate}
              endDate={checkOutDate}
              onRangeChange={handleDateRangeChange}
              placeholder="Tap to select dates"
              onOpen={handleCalendarOpen}
            />
          </View>
          <FormInput
            label="Confirmation number"
            value={confirmationNumber}
            onChangeText={setConfirmationNumber}
            placeholder="Booking reference"
            iconName="badge"
          />
          <FormInput
            label="Room details"
            value={roomDetails}
            onChangeText={setRoomDetails}
            placeholder="e.g. King room, 2 guests"
            iconName="bed"
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
              <Text style={styles.saveButtonText}>Save Lodging</Text>
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
