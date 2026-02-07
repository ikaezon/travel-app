import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Platform,
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
import { TripSelector } from '../../components/domain/TripSelector';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { MainStackParamList } from '../../navigation/types';
import { fontFamilies, glassStyles, glassConstants } from '../../theme';
import { mockImages } from '../../data/mocks';
import { usePressAnimation, useTrips } from '../../hooks';
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

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topOffset = insets.top + 8;
  const sourceAnim = usePressAnimation();

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
        rightIconName={flightForm.airline ? 'check-circle' : undefined}
        rightIconColor={theme.colors.status.success}
        variant="glass"
      />
      <FormInput
        label="Flight Number"
        value={flightForm.flightNumber}
        onChangeText={(text) => setFlightForm((prev) => ({ ...prev, flightNumber: text }))}
        iconName="confirmation-number"
        rightIconName={flightForm.flightNumber ? 'check-circle' : undefined}
        rightIconColor={theme.colors.status.success}
        variant="glass"
      />
      <FormInput
        label="Departure Airport"
        value={flightForm.departureAirport}
        onChangeText={(text) => setFlightForm((prev) => ({ ...prev, departureAirport: text }))}
        placeholder="e.g. LAX"
        iconName="flight-takeoff"
        variant="glass"
      />
      <FormInput
        label="Arrival Airport"
        value={flightForm.arrivalAirport}
        onChangeText={(text) => setFlightForm((prev) => ({ ...prev, arrivalAirport: text }))}
        placeholder="e.g. JFK"
        iconName="flight-land"
        variant="glass"
      />
      <View style={styles.rowContainer}>
        <DatePickerInput
          label="Date"
          value={flightForm.departureDate}
          onChange={(text) => setFlightForm((prev) => ({ ...prev, departureDate: text }))}
          placeholder="Tap to select date"
          iconName="calendar-today"
          style={styles.halfWidth}
          variant="glass"
        />
        <TimePickerInput
          label="Time"
          value={flightForm.departureTime}
          onChange={(text) => setFlightForm((prev) => ({ ...prev, departureTime: text }))}
          placeholder="Tap to select"
          iconName="schedule"
          style={styles.halfWidth}
          variant="glass"
        />
      </View>
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
        rightIconName={hotelForm.propertyName ? 'check-circle' : undefined}
        rightIconColor={theme.colors.status.success}
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
      <View style={styles.rowContainer}>
        <DatePickerInput
          label="Check-in"
          value={hotelForm.checkInDate}
          onChange={(text) => setHotelForm((prev) => ({ ...prev, checkInDate: text }))}
          placeholder="Check-in date"
          iconName="calendar-today"
          style={styles.halfWidth}
          variant="glass"
        />
        <DatePickerInput
          label="Check-out"
          value={hotelForm.checkOutDate}
          onChange={(text) => setHotelForm((prev) => ({ ...prev, checkOutDate: text }))}
          placeholder="Check-out date"
          iconName="event"
          style={styles.halfWidth}
          variant="glass"
        />
      </View>
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
        rightIconName={trainForm.operator ? 'check-circle' : undefined}
        rightIconColor={theme.colors.status.success}
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
      <View style={styles.rowContainer}>
        <DatePickerInput
          label="Date"
          value={trainForm.departureDate}
          onChange={(text) => setTrainForm((prev) => ({ ...prev, departureDate: text }))}
          placeholder="Tap to select date"
          iconName="calendar-today"
          style={styles.halfWidth}
          variant="glass"
        />
        <TimePickerInput
          label="Time"
          value={trainForm.departureTime}
          onChange={(text) => setTrainForm((prev) => ({ ...prev, departureTime: text }))}
          placeholder="Tap to select"
          iconName="schedule"
          style={styles.halfWidth}
          variant="glass"
        />
      </View>
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
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: topOffset + 72,
              paddingBottom: 120 + keyboardHeight,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sourceSection}>
            <Animated.View style={{ transform: [{ scale: sourceAnim.scaleAnim }] }}>
            <Pressable 
              style={[
                styles.sourceCard,
                theme.glass.cardWrapperStyle
              ]} 
              onPressIn={sourceAnim.onPressIn} 
              onPressOut={sourceAnim.onPressOut}
            >
              <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" absoluteFill style={glassStyles.blurContent} />
              <View style={styles.sourceCardInner}>
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
                <Pressable style={[styles.thumbnailContainer, { borderColor: theme.glass.border }]}>
                  <ImageBackground
                    source={{ uri: sourceImageUrl }}
                    style={styles.thumbnail}
                    imageStyle={styles.thumbnailImage}
                  >
                    <View style={styles.thumbnailOverlay}>
                      <MaterialIcons name="zoom-in" size={24} color="white" />
                    </View>
                  </ImageBackground>
                </Pressable>
              </View>
              </View>
            </Pressable>
            </Animated.View>
          </View>

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
        </ScrollView>

        {reservationType !== 'unknown' && (
          <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
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
    flex: 1,
  },
  container: {
    flex: 1,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  sourceSection: {
    marginBottom: 16,
  },
  sourceCard: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    position: 'relative',
  },
  sourceCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  sourceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
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
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
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
