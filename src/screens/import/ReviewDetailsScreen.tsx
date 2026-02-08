import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
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
import { MainStackParamList } from '../../navigation/types';
import { fontFamilies, glassStyles, glassConstants, spacing } from '../../theme';
import { mockImages } from '../../data/mocks';
import { usePressAnimation, useTrips, useKeyboardHeight } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import {
  createFlightReservation,
  createLodgingReservation,
  createTrainReservation,
} from '../../data';
import type { ParsedReservation } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type ReviewDetailsRouteProp = RouteProp<MainStackParamList, 'ReviewDetails'>;

/** Flight form fields */
interface FlightFormData {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  confirmationCode: string;
}

/** Hotel form fields */
interface HotelFormData {
  propertyName: string;
  address: string;
  checkInDate: string;
  checkOutDate: string;
  confirmationCode: string;
}

/** Train form fields */
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
    return {
      airline: parsed.airline,
      flightNumber: parsed.flightNumber,
      departureAirport: parsed.departureAirport,
      arrivalAirport: parsed.arrivalAirport,
      departureDate: parsed.departureDate,
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
    return {
      operator: parsed.operator,
      trainNumber: parsed.trainNumber,
      departureStation: parsed.departureStation,
      arrivalStation: parsed.arrivalStation,
      departureDate: parsed.departureDate,
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
  const parsedData = route.params?.parsedData;

  const reservationType = parsedData?.type ?? 'unknown';

  // Trip selection
  const { trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Form state for each type
  const [flightForm, setFlightForm] = useState<FlightFormData>(() => initFlightForm(parsedData));
  const [hotelForm, setHotelForm] = useState<HotelFormData>(() => initHotelForm(parsedData));
  const [trainForm, setTrainForm] = useState<TrainFormData>(() => initTrainForm(parsedData));

  const keyboardHeight = useKeyboardHeight();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topOffset = insets.top + 8;
  const sourceAnim = usePressAnimation();

  const handleBackPress = () => navigation.goBack();

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
        await createLodgingReservation({
          tripId: selectedTripId,
          propertyName: hotelForm.propertyName,
          address: hotelForm.address,
          checkInDate: hotelForm.checkInDate,
          checkOutDate: hotelForm.checkOutDate,
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
      style={glassStyles.screenGradient}
    >
      <View style={glassStyles.screenContainer}>
        <ScrollView
          style={glassStyles.screenScrollView}
          contentContainerStyle={[
            glassStyles.screenScrollContent,
            {
              paddingTop: topOffset + 72,
              paddingBottom: spacing.xxl + keyboardHeight,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Source Card - aligned with other glass cards */}
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
                      <ImageBackground
                        source={{ uri: sourceImageUrl }}
                        style={styles.thumbnail}
                        imageStyle={styles.thumbnailImage}
                      >
                        <View style={styles.thumbnailOverlay}>
                          <MaterialIcons name="zoom-in" size={24} color="white" />
                        </View>
                      </ImageBackground>
                    </View>
                  </View>
                </AdaptiveGlassView>
              </View>
            </Pressable>
          </Animated.View>

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

          {/* Confirm button at bottom of scroll content - not floating */}
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
        </ScrollView>

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
    borderRadius: glassConstants.radius.icon,
    overflow: 'hidden',
    borderWidth: 2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailImage: {
    borderRadius: glassConstants.radius.icon,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
