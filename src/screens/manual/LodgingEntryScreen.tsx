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
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
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
            label="Property name"
            value={propertyName}
            onChangeText={setPropertyName}
            placeholder="e.g. Hilton Downtown"
            iconName="hotel"
            variant="glass"
          />
          <FormInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Street, city, country"
            iconName="location-on"
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
              <Text style={styles.headerTitle}>Lodging Details</Text>
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
