import React, { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { AddressAutocomplete } from '../../components/ui/AddressAutocomplete';
import { DualAirportInput } from '../../components/ui/DualAirportInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import {
  colors,
  spacing,
  fontFamilies,
  glassStyles,
  glassColors,
} from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId } from '../../hooks';
import { reservationService, tripService } from '../../data';
import { formatCalendarDateToLongDisplay, parseToCalendarDate } from '../../utils/dateFormat';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'EditReservation'>;
type EditReservationRouteProp = RouteProp<MainStackParamList, 'EditReservation'>;

export default function EditReservationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditReservationRouteProp>();
  const insets = useSafeAreaInsets();
  const reservationId = route.params?.reservationId ?? '';

  const { reservation, isLoading } = useReservationByTimelineId(reservationId);
  const [providerName, setProviderName] = useState('');
  const [routeText, setRouteText] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [date, setDate] = useState('');
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [terminal, setTerminal] = useState('');
  const [gate, setGate] = useState('');
  const [seat, setSeat] = useState('');
  const [address, setAddress] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [saving, setSaving] = useState(false);

  const topOffset = insets.top + 8;

  useEffect(() => {
    if (reservation) {
      setProviderName(reservation.providerName);
      setRouteText(reservation.route);
      setDate(reservation.date);
      setConfirmationCode(reservation.confirmationCode);
      setTerminal(reservation.terminal ?? '');
      setGate(reservation.gate ?? '');
      setSeat(reservation.seat ?? '');
      setAddress(reservation.address ?? '');

      if (reservation.type === 'flight' && reservation.route) {
        const parts = reservation.route.split(/\s*[→\-–—]\s*|\s+to\s+/i).map((s) => s.trim());
        if (parts.length >= 2) {
          setDepartureAirport(parts[0] || '');
          setArrivalAirport(parts[1] || '');
        } else if (parts.length === 1 && parts[0]) {
          setDepartureAirport(parts[0]);
        }
      }

      if (reservation.type === 'hotel' && reservation.duration) {
        const parts = reservation.duration.split(/\s*-\s*/);
        if (parts.length >= 2) {
          const start = parseToCalendarDate(parts[0].trim());
          const end = parseToCalendarDate(parts[1].trim());
          if (start) setCheckInDate(start);
          if (end) setCheckOutDate(end);
        } else {
          const single = parseToCalendarDate(reservation.duration.trim());
          if (single) {
            setCheckInDate(single);
            setCheckOutDate(single);
          }
        }
      }
    }
  }, [reservation]);

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
    if (!reservation) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      let finalDate = date;
      let finalDuration = reservation.duration;
      if (reservation.type === 'hotel' && checkInDate && checkOutDate) {
        const startDisplay = formatCalendarDateToLongDisplay(checkInDate);
        const endDisplay = formatCalendarDateToLongDisplay(checkOutDate);
        finalDuration = checkInDate === checkOutDate ? startDisplay : `${startDisplay} - ${endDisplay}`;
        finalDate = startDisplay;
      }

      const finalRoute =
        reservation.type === 'flight'
          ? [departureAirport.trim(), arrivalAirport.trim()].filter(Boolean).join(' → ') || routeText
          : reservation.type === 'hotel'
            ? providerName
            : routeText;

      const updated = await reservationService.updateReservation(reservation.id, {
        providerName,
        route: finalRoute,
        date: finalDate,
        duration: finalDuration,
        confirmationCode,
        terminal: terminal || undefined,
        gate: gate || undefined,
        seat: seat || undefined,
        address: address.trim() || undefined,
      });
      if (updated) {
        await tripService.updateTimelineItem(reservationId, {
          subtitle: finalRoute || routeText,
          reservationId: reservation.id,
        });
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Could not update reservation. It may have been deleted.');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save changes.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleHotelDateRangeChange = (start: string | null, end: string | null) => {
    setCheckInDate(start);
    setCheckOutDate(end);
  };

  const handleBackPress = () => navigation.goBack();

  if (isLoading || !reservation) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <View style={[styles.headerContainer, { top: topOffset }]}>
            <BlurView intensity={24} tint="light" style={[styles.headerBlur, glassStyles.blurContentLarge]}>
              <View style={styles.glassOverlay} pointerEvents="none" />
              <View style={styles.headerContent}>
                <Pressable style={styles.backButton} onPress={handleBackPress}>
                  <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
                </Pressable>
                <Text style={styles.headerTitle}>Edit reservation</Text>
                <View style={styles.headerSpacer} />
              </View>
            </BlurView>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  const isFlight = reservation.type === 'flight';
  const isHotel = reservation.type === 'hotel';

  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
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
              paddingBottom: spacing.xxl + keyboardHeight,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormInput
            label={isHotel ? 'Property name' : 'Provider'}
            value={providerName}
            onChangeText={setProviderName}
            placeholder={isHotel ? 'e.g. Hilton Downtown' : 'e.g. Air France'}
            iconName={isHotel ? 'hotel' : 'business'}
            variant="glass"
          />
          {isFlight ? (
            <DualAirportInput
              departureValue={departureAirport}
              arrivalValue={arrivalAirport}
              onDepartureChange={setDepartureAirport}
              onArrivalChange={setArrivalAirport}
              departurePlaceholder="LAX"
              arrivalPlaceholder="CDG"
            />
          ) : !isHotel ? (
            <FormInput
              label="Route"
              value={routeText}
              onChangeText={setRouteText}
              placeholder="e.g. Paris → London"
              iconName="route"
              variant="glass"
            />
          ) : null}
          {isHotel && (
            <AddressAutocomplete
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Search for an address..."
              variant="glass"
            />
          )}
          {isHotel ? (
            <DateRangePickerInput
              label="Check-in / Check-out dates"
              startDate={checkInDate}
              endDate={checkOutDate}
              onRangeChange={handleHotelDateRangeChange}
              placeholder="Tap to select dates"
              variant="glass"
            />
          ) : (
            <DatePickerInput
              label="Date"
              value={date}
              onChange={setDate}
              placeholder="Tap to select date"
              iconName="event"
              variant="glass"
            />
          )}
          <FormInput
            label="Confirmation code"
            value={confirmationCode}
            onChangeText={setConfirmationCode}
            placeholder="Booking reference"
            iconName="confirmation-number"
            variant="glass"
          />
          {isFlight && (
            <>
              <FormInput
                label="Terminal"
                value={terminal}
                onChangeText={setTerminal}
                placeholder="e.g. 2"
                iconName="meeting-room"
                variant="glass"
              />
              <FormInput
                label="Gate"
                value={gate}
                onChangeText={setGate}
                placeholder="e.g. B12"
                iconName="door-sliding"
                variant="glass"
              />
              <FormInput
                label="Seat"
                value={seat}
                onChangeText={setSeat}
                placeholder="e.g. 14A"
                iconName="airline-seat-recline-extra"
                variant="glass"
              />
            </>
          )}

          <ShimmerButton
            label="Save changes"
            iconName="save"
            onPress={handleSave}
            disabled={saving}
            loading={saving}
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
              <Text style={styles.headerTitle}>Edit reservation</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
});
