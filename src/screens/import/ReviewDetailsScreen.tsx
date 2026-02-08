import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Keyboard,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdaptiveGlassView } from '../../components/ui/AdaptiveGlassView';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { TimePickerInput } from '../../components/ui/TimePickerInput';
import { DualAirportInput } from '../../components/ui/DualAirportInput';
import { TripSelector } from '../../components/domain/TripSelector';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { KeyboardAwareScrollView } from '../../components/ui/KeyboardAwareScrollView';
import { MainStackParamList } from '../../navigation/types';
import { fontFamilies, glassStyles, glassConstants, spacing } from '../../theme';
import { mockImages } from '../../data/mocks';
import { usePressAnimation, useTrips } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import {
  createFlightReservation,
  createLodgingReservation,
  createTrainReservation,
} from '../../data';
import { parseReservationFromImage } from '../../data/services/parseReservationService';
import { FormFieldSkeleton } from '../../components/ui/FormFieldSkeleton';
import { formatCalendarDateToLongDisplay, parseToCalendarDate } from '../../utils/dateFormat';
import type { ParsedReservation } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type ReviewDetailsRouteProp = RouteProp<MainStackParamList, 'ReviewDetails'>;

interface FlightFormData {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  confirmationCode: string;
}

interface HotelFormData {
  propertyName: string;
  address: string;
  checkInDate: string;
  checkOutDate: string;
  confirmationCode: string;
}

interface TrainFormData {
  operator: string;
  trainNumber: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  confirmationCode: string;
}

function initFlightForm(parsed?: ParsedReservation): FlightFormData {
  if (parsed?.type === 'flight') {
    const calDate = parseToCalendarDate(parsed.departureDate);
    return {
      airline: parsed.airline,
      flightNumber: parsed.flightNumber,
      departureAirport: parsed.departureAirport,
      arrivalAirport: parsed.arrivalAirport,
      departureDate: calDate ? formatCalendarDateToLongDisplay(calDate) : parsed.departureDate,
      departureTime: parsed.departureTime,
      confirmationCode: parsed.confirmationCode,
    };
  }
  return { airline: '', flightNumber: '', departureAirport: '', arrivalAirport: '', departureDate: '', departureTime: '', confirmationCode: '' };
}

function initHotelForm(parsed?: ParsedReservation): HotelFormData {
  if (parsed?.type === 'hotel') {
    return {
      propertyName: parsed.propertyName,
      address: parsed.address,
      checkInDate: parsed.checkInDate,
      checkOutDate: parsed.checkOutDate,
      confirmationCode: parsed.confirmationCode,
    };
  }
  return { propertyName: '', address: '', checkInDate: '', checkOutDate: '', confirmationCode: '' };
}

function initTrainForm(parsed?: ParsedReservation): TrainFormData {
  if (parsed?.type === 'train') {
    const calDate = parseToCalendarDate(parsed.departureDate);
    return {
      operator: parsed.operator,
      trainNumber: parsed.trainNumber,
      departureStation: parsed.departureStation,
      arrivalStation: parsed.arrivalStation,
      departureDate: calDate ? formatCalendarDateToLongDisplay(calDate) : parsed.departureDate,
      departureTime: parsed.departureTime,
      confirmationCode: parsed.confirmationCode,
    };
  }
  return { operator: '', trainNumber: '', departureStation: '', arrivalStation: '', departureDate: '', departureTime: '', confirmationCode: '' };
}

function getSectionTitle(type: string): string {
  switch (type) {
    case 'flight': return 'Flight Information';
    case 'hotel': return 'Hotel Information';
    case 'train': return 'Train Information';
    default: return 'Reservation Details';
  }
}

function getConfirmIcon(type: string): string {
  switch (type) {
    case 'flight': return 'flight';
    case 'hotel': return 'hotel';
    case 'train': return 'train';
    default: return 'check';
  }
}

export default function ReviewDetailsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReviewDetailsRouteProp>();
  const insets = useSafeAreaInsets();
  const sourceImageUrl = route.params?.imageUri || mockImages.defaultReviewImage;
  const initialParsedData = route.params?.parsedData;
  const base64 = route.params?.base64;

  const [parsedData, setParsedData] = useState<ParsedReservation | undefined>(initialParsedData);
  const [isParsing, setIsParsing] = useState(!initialParsedData && !!route.params?.imageUri);

  const reservationType = parsedData?.type ?? 'unknown';

  const { trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const [flightForm, setFlightForm] = useState<FlightFormData>(() => initFlightForm(parsedData ?? initialParsedData));
  const [hotelForm, setHotelForm] = useState<HotelFormData>(() => initHotelForm(parsedData ?? initialParsedData));
  const [trainForm, setTrainForm] = useState<TrainFormData>(() => initTrainForm(parsedData ?? initialParsedData));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const topOffset = insets.top + 8;
  const sourceAnim = usePressAnimation();

  useEffect(() => {
    if (parsedData || !sourceImageUrl || sourceImageUrl === mockImages.defaultReviewImage) return;

    let cancelled = false;
    setIsParsing(true);

    const run = async () => {
      try {
        const result = await parseReservationFromImage(
          base64 ? { base64 } : { uri: sourceImageUrl }
        );
        if (!cancelled) {
          setParsedData(result);
          setFlightForm(initFlightForm(result));
          setHotelForm(initHotelForm(result));
          setTrainForm(initTrainForm(result));
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Could not parse screenshot. Try again.';
          Alert.alert('Parsing Failed', message, [
            { text: 'Manual Entry', onPress: () => navigation.navigate('ManualEntryOptions') },
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          setParsedData({ type: 'unknown', rawText: message });
        }
      } finally {
        if (!cancelled) setIsParsing(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [sourceImageUrl, base64, parsedData, navigation]);

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleConfirm = async () => {
    Keyboard.dismiss();

    if (!selectedTripId) {
      Alert.alert('Select a trip', 'Choose a trip above to save this reservation.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (reservationType === 'flight') {
        await createFlightReservation({
          tripId: selectedTripId,
          airline: flightForm.airline,
          flightNumber: flightForm.flightNumber,
          departureAirport: flightForm.departureAirport,
          arrivalAirport: flightForm.arrivalAirport,
          departureDate: flightForm.departureDate,
          departureTime: flightForm.departureTime,
          confirmationNumber: flightForm.confirmationCode,
        });
      } else if (reservationType === 'hotel') {
        const checkInCal = parseToCalendarDate(hotelForm.checkInDate);
        const checkOutCal = parseToCalendarDate(hotelForm.checkOutDate);
        await createLodgingReservation({
          tripId: selectedTripId,
          propertyName: hotelForm.propertyName,
          address: hotelForm.address,
          checkInDate: checkInCal ? formatCalendarDateToLongDisplay(checkInCal) : hotelForm.checkInDate,
          checkOutDate: checkOutCal ? formatCalendarDateToLongDisplay(checkOutCal) : hotelForm.checkOutDate,
          confirmationNumber: hotelForm.confirmationCode,
        });
      } else if (reservationType === 'train') {
        await createTrainReservation({
          tripId: selectedTripId,
          operator: trainForm.operator,
          trainNumber: trainForm.trainNumber,
          departureStation: trainForm.departureStation,
          arrivalStation: trainForm.arrivalStation,
          departureDate: trainForm.departureDate,
          departureTime: trainForm.departureTime,
          confirmationNumber: trainForm.confirmationCode,
        });
      }

      navigation.navigate('Tabs');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save reservation. Try again.';
      Alert.alert('Error', message, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFlightForm = () => (
    <View style={styles.formContainer}>
      <FormInput
        label="Airline"
        value={flightForm.airline}
        onChangeText={(text) => setFlightForm((prev) => ({ ...prev, airline: text }))}
        iconName="flight"
        showGlassCheck={!!flightForm.airline}
        variant="glass"
      />
      <FormInput
        label="Flight Number"
        value={flightForm.flightNumber}
        onChangeText={(text) => setFlightForm((prev) => ({ ...prev, flightNumber: text }))}
        iconName="confirmation-number"
        showGlassCheck={!!flightForm.flightNumber}
        variant="glass"
      />
      <DualAirportInput
        departureValue={flightForm.departureAirport}
        arrivalValue={flightForm.arrivalAirport}
        onDepartureChange={(text) => setFlightForm((prev) => ({ ...prev, departureAirport: text }))}
        onArrivalChange={(text) => setFlightForm((prev) => ({ ...prev, arrivalAirport: text }))}
        departurePlaceholder="LAX"
        arrivalPlaceholder="JFK"
      />
      <DatePickerInput
        label="Departure Date"
        value={flightForm.departureDate}
        onChange={(text) => setFlightForm((prev) => ({ ...prev, departureDate: text }))}
        placeholder="Tap to select date"
        iconName="calendar-today"
        variant="glass"
      />
      <TimePickerInput
        label="Departure Time"
        value={flightForm.departureTime}
        onChange={(text) => setFlightForm((prev) => ({ ...prev, departureTime: text }))}
        placeholder="Tap to select time"
        iconName="schedule"
        variant="glass"
      />
      <FormInput
        label="Confirmation Code"
        value={flightForm.confirmationCode}
        onChangeText={(text) => setFlightForm((prev) => ({ ...prev, confirmationCode: text }))}
        placeholder="e.g. G7K9L2"
        iconName="badge"
        isDashed={!flightForm.confirmationCode}
        variant="glass"
      />
    </View>
  );

  const renderHotelForm = () => (
    <View style={styles.formContainer}>
      <FormInput
        label="Property Name"
        value={hotelForm.propertyName}
        onChangeText={(text) => setHotelForm((prev) => ({ ...prev, propertyName: text }))}
        iconName="hotel"
        showGlassCheck={!!hotelForm.propertyName}
        variant="glass"
      />
      <FormInput
        label="Address"
        value={hotelForm.address}
        onChangeText={(text) => setHotelForm((prev) => ({ ...prev, address: text }))}
        placeholder="e.g. 123 Main St"
        iconName="location-on"
        variant="glass"
      />
      <DatePickerInput
        label="Check-in Date"
        value={hotelForm.checkInDate}
        onChange={(text) => setHotelForm((prev) => ({ ...prev, checkInDate: text }))}
        placeholder="Tap to select check-in date"
        iconName="calendar-today"
        variant="glass"
      />
      <DatePickerInput
        label="Check-out Date"
        value={hotelForm.checkOutDate}
        onChange={(text) => setHotelForm((prev) => ({ ...prev, checkOutDate: text }))}
        placeholder="Tap to select check-out date"
        iconName="event"
        variant="glass"
      />
      <FormInput
        label="Confirmation Code"
        value={hotelForm.confirmationCode}
        onChangeText={(text) => setHotelForm((prev) => ({ ...prev, confirmationCode: text }))}
        placeholder="e.g. G7K9L2"
        iconName="badge"
        isDashed={!hotelForm.confirmationCode}
        variant="glass"
      />
    </View>
  );

  const renderTrainForm = () => (
    <View style={styles.formContainer}>
      <FormInput
        label="Operator"
        value={trainForm.operator}
        onChangeText={(text) => setTrainForm((prev) => ({ ...prev, operator: text }))}
        iconName="train"
        showGlassCheck={!!trainForm.operator}
        variant="glass"
      />
      <FormInput
        label="Train Number"
        value={trainForm.trainNumber}
        onChangeText={(text) => setTrainForm((prev) => ({ ...prev, trainNumber: text }))}
        iconName="confirmation-number"
        variant="glass"
      />
      <FormInput
        label="Departure Station"
        value={trainForm.departureStation}
        onChangeText={(text) => setTrainForm((prev) => ({ ...prev, departureStation: text }))}
        placeholder="e.g. Penn Station"
        iconName="departure-board"
        variant="glass"
      />
      <FormInput
        label="Arrival Station"
        value={trainForm.arrivalStation}
        onChangeText={(text) => setTrainForm((prev) => ({ ...prev, arrivalStation: text }))}
        placeholder="e.g. Union Station"
        iconName="place"
        variant="glass"
      />
      <DatePickerInput
        label="Departure Date"
        value={trainForm.departureDate}
        onChange={(text) => setTrainForm((prev) => ({ ...prev, departureDate: text }))}
        placeholder="Tap to select date"
        iconName="calendar-today"
        variant="glass"
      />
      <TimePickerInput
        label="Departure Time"
        value={trainForm.departureTime}
        onChange={(text) => setTrainForm((prev) => ({ ...prev, departureTime: text }))}
        placeholder="Tap to select time"
        iconName="schedule"
        variant="glass"
      />
      <FormInput
        label="Confirmation Code"
        value={trainForm.confirmationCode}
        onChangeText={(text) => setTrainForm((prev) => ({ ...prev, confirmationCode: text }))}
        placeholder="e.g. G7K9L2"
        iconName="badge"
        isDashed={!trainForm.confirmationCode}
        variant="glass"
      />
    </View>
  );

  const renderUnknownMessage = () => (
    <View style={[glassStyles.formWrapper, theme.glass.cardWrapperStyle]}>
      <AdaptiveGlassView
        intensity={24}
        darkIntensity={10}
        glassEffectStyle="clear"
        style={[glassStyles.formBlur, glassStyles.blurContent]}
      >
        <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
        <View style={styles.unknownContainer}>
          <MaterialIcons name="help-outline" size={48} color={theme.colors.text.tertiary} />
          <Text style={[styles.unknownTitle, { color: theme.colors.text.primary }]}>
            Could not identify reservation
          </Text>
          <Text style={[styles.unknownSubtitle, { color: theme.colors.text.secondary }]}>
            {parsedData?.type === 'unknown' && parsedData.rawText
              ? parsedData.rawText
              : 'The screenshot could not be parsed. Try a different image or use manual entry.'}
          </Text>
          <Pressable
            style={[styles.manualEntryButton, { backgroundColor: theme.colors.primaryLight }]}
            onPress={() => navigation.navigate('ManualEntryOptions')}
          >
            <Text style={[styles.manualEntryText, { color: theme.colors.primary }]}>
              Switch to Manual Entry
            </Text>
          </Pressable>
        </View>
      </AdaptiveGlassView>
    </View>
  );

  const renderForm = () => {
    switch (reservationType) {
      case 'flight': return renderFlightForm();
      case 'hotel': return renderHotelForm();
      case 'train': return renderTrainForm();
      default: return renderUnknownMessage();
    }
  };

  const canSubmit = reservationType !== 'unknown' && !!selectedTripId && !isSubmitting;

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[glassStyles.screenGradient, styles.gradientContainer]}
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
          <Animated.View style={{ transform: [{ scale: sourceAnim.scaleAnim }] }}>
            <Pressable 
              onPressIn={sourceAnim.onPressIn} 
              onPressOut={sourceAnim.onPressOut}
            >
              <View style={[glassStyles.formWrapper, theme.glass.cardWrapperStyle]}>
                <AdaptiveGlassView 
                  intensity={24} 
                  darkIntensity={10} 
                  glassEffectStyle="clear" 
                  style={[glassStyles.formBlur, glassStyles.blurContent]}
                >
                  <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
                  <View style={styles.sourceContent}>
                    <View style={styles.sourceInfo}>
                      <View style={styles.sourceHeader}>
                        <MaterialIcons name="document-scanner" size={20} color={theme.colors.primary} />
                        <Text style={[styles.sourceLabel, { color: theme.colors.text.secondary }]}>SOURCE</Text>
                      </View>
                      <Text style={[styles.sourceTitle, { color: theme.colors.text.primary }]}>Original Screenshot</Text>
                      <Text style={[styles.sourceSubtitle, { color: theme.colors.text.secondary }]}>
                        Tap to expand and verify details
                      </Text>
                    </View>
                    <View style={[styles.thumbnailContainer, { borderColor: theme.glass.border }]}>
                      <Image
                        source={{ uri: sourceImageUrl }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.thumbnailOverlay}>
                        <MaterialIcons name="zoom-in" size={24} color="white" />
                      </View>
                    </View>
                  </View>
                </AdaptiveGlassView>
              </View>
            </Pressable>
          </Animated.View>

          {isParsing ? (
            <>
              <FormFieldSkeleton bars={2} />
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Reservation Details
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
                  Extracting dates, locations, and details from your screenshot...
                </Text>
              </View>
              <FormFieldSkeleton bars={2} />
              <FormFieldSkeleton bars={2} />
              <FormFieldSkeleton bars={2} />
              <FormFieldSkeleton bars={2} />
              <FormFieldSkeleton bars={2} />
            </>
          ) : (
            <>
              {reservationType !== 'unknown' && (
                <TripSelector
                  trips={trips}
                  selectedTripId={selectedTripId}
                  onSelectTrip={setSelectedTripId}
                  isLoading={tripsLoading}
                  error={tripsError}
                  variant="glass"
                />
              )}

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  {getSectionTitle(reservationType)}
                </Text>
                {reservationType !== 'unknown' && (
                  <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
                    AI has auto-filled these details. Please verify.
                  </Text>
                )}
              </View>

              {renderForm()}

              {reservationType !== 'unknown' && (
                <View style={styles.confirmButtonContainer}>
                  <ShimmerButton
                    label="Confirm & Save"
                    iconName={getConfirmIcon(reservationType) as any}
                    onPress={handleConfirm}
                    disabled={!canSubmit}
                    loading={isSubmitting}
                    variant="boardingPass"
                  />
                </View>
              )}
            </>
          )}
        </KeyboardAwareScrollView>

        <GlassNavHeader 
          title="Review Details" 
          onBackPress={handleBackPress} 
          rightAction={{ icon: 'help-outline', onPress: () => {}, accessibilityLabel: 'Help' }} 
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    overflow: 'hidden',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  sourceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 10,
  },
  sourceInfo: {
    flex: 1,
    gap: 4,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sourceLabel: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sourceTitle: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    lineHeight: 18,
  },
  sourceSubtitle: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    lineHeight: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.05 }],
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fontFamilies.semibold,
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    marginTop: 4,
  },
  formContainer: {
    gap: 12,
  },
  confirmButtonContainer: {
    marginTop: spacing.lg,
  },
  unknownContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  unknownTitle: {
    fontSize: 18,
    fontFamily: fontFamilies.semibold,
    textAlign: 'center',
  },
  unknownSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  manualEntryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: glassConstants.radius.icon,
  },
  manualEntryText: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
  },
});
