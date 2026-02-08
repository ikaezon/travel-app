import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { AddressAutocomplete } from '../../components/ui/AddressAutocomplete';
import { DualAirportInput } from '../../components/ui/DualAirportInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
import { TimePickerInput } from '../../components/ui/TimePickerInput';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { AdaptiveGlassView } from '../../components/ui/AdaptiveGlassView';
import {
  spacing,
  borderRadius,
  fontFamilies,
  glassStyles,
  glassConstants,
} from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId, useUpdateReservation, useTimelineItemById } from '../../hooks';
import { tripService } from '../../data';
import { formatCalendarDateToLongDisplay, parseToCalendarDate } from '../../utils/dateFormat';

/**
 * Parses the timeline title to extract provider name and flight/train number.
 * The title format is typically "ProviderName Number" (e.g., "Delta 123" or "SNCF TGV 6789")
 * Returns { providerName, number } where number may be empty if not present.
 */
function parseTimelineTitle(title: string, reservationProviderName: string): { providerName: string; number: string } {
  const trimmedTitle = title.trim();
  const trimmedProvider = reservationProviderName.trim();
  
  if (trimmedTitle.toLowerCase().startsWith(trimmedProvider.toLowerCase())) {
    const remainder = trimmedTitle.slice(trimmedProvider.length).trim();
    return { providerName: trimmedProvider, number: remainder };
  }
  
  const lastSpaceIndex = trimmedTitle.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    const possibleNumber = trimmedTitle.slice(lastSpaceIndex + 1);
    if (/\d/.test(possibleNumber)) {
      return { providerName: trimmedTitle.slice(0, lastSpaceIndex), number: possibleNumber };
    }
  }
  
  return { providerName: trimmedTitle, number: '' };
}

/**
 * Converts 12-hour time format (e.g., "2:30 PM") to 24-hour format (e.g., "14:30")
 * for the TimePickerInput which uses 24-hour format internally.
 */
function parse12HourTo24Hour(time12h: string): string {
  if (!time12h) return '';
  
  if (!/[ap]m/i.test(time12h)) return time12h;
  
  const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12h;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'EditReservation'>;
type EditReservationRouteProp = RouteProp<MainStackParamList, 'EditReservation'>;

export default function EditReservationScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditReservationRouteProp>();
  const insets = useSafeAreaInsets();
  const timelineItemId = route.params?.timelineItemId ?? '';

  const { reservation, isLoading } = useReservationByTimelineId(timelineItemId);
  const { timelineItem, isLoading: isLoadingTimeline } = useTimelineItemById(timelineItemId);
  const { updateReservation, isUpdating } = useUpdateReservation();
  const [providerName, setProviderName] = useState('');
  const [flightOrTrainNumber, setFlightOrTrainNumber] = useState('');
  const [routeText, setRouteText] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
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

      if (reservation.type === 'hotel') {
        let parsedStart: string | null = null;
        let parsedEnd: string | null = null;
        const duration = reservation.duration?.trim();
        if (duration) {
          const parts = duration.split(/\s*[-–—]\s*/);
          if (parts.length >= 2) {
            parsedStart = parseToCalendarDate(parts[0].trim());
            parsedEnd = parseToCalendarDate(parts[1].trim());
          } else {
            parsedStart = parseToCalendarDate(duration);
            parsedEnd = parsedStart;
          }
        }
        if (!parsedStart && reservation.date) {
          parsedStart = parseToCalendarDate(reservation.date);
          parsedEnd = parsedStart;
        }
        if (parsedStart) setCheckInDate(parsedStart);
        if (parsedEnd) setCheckOutDate(parsedEnd);
      }

      if (timelineItem) {
        if (reservation.type === 'flight' || reservation.type === 'train') {
          const parsed = parseTimelineTitle(timelineItem.title, reservation.providerName);
          setFlightOrTrainNumber(parsed.number);
        }
        
        if (timelineItem.time) {
          const time24h = parse12HourTo24Hour(timelineItem.time);
          setDepartureTime(time24h);
        }
      }
    }
  }, [reservation, timelineItem]);

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

      const updated = await updateReservation(reservation.id, {
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
        const trimmedNumber = flightOrTrainNumber.trim();
        const finalTitle = trimmedNumber ? `${providerName} ${trimmedNumber}` : providerName;

        const trimmedCode = confirmationCode.trim();
        const trimmedTime = departureTime.trim();
        await tripService.updateTimelineItem(timelineItemId, {
          title: finalTitle,
          date: finalDate,
          subtitle: finalRoute || routeText,
          metadata: trimmedCode ? `Conf: #${trimmedCode}` : 'Conf: —',
          time: trimmedTime || '',
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

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  if (isLoading || isLoadingTimeline || !reservation) {
    return (
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <GlassNavHeader title="Edit reservation" onBackPress={handleBackPress} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  const isFlight = reservation.type === 'flight';
  const isHotel = reservation.type === 'hotel';
  const isTrain = reservation.type === 'train';

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
              paddingBottom: spacing.xxl + keyboardHeight,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormInput
            label={isHotel ? 'Property name' : isFlight ? 'Airline' : 'Provider'}
            value={providerName}
            onChangeText={setProviderName}
            placeholder={isHotel ? 'e.g. Hilton Downtown' : isFlight ? 'e.g. Delta, United' : 'e.g. Amtrak'}
            iconName={isHotel ? 'hotel' : isFlight ? 'flight' : 'business'}
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
          {(isFlight || isTrain) && (
            <>
              <FormInput
                label={isFlight ? 'Flight number' : 'Train number'}
                value={flightOrTrainNumber}
                onChangeText={setFlightOrTrainNumber}
                placeholder={isFlight ? 'e.g. 123' : 'e.g. TGV 6789'}
                iconName={isFlight ? 'flight' : 'train'}
                variant="glass"
              />
              <TimePickerInput
                label="Departure time"
                value={departureTime}
                onChange={setDepartureTime}
                placeholder="Tap to select time"
                variant="glass"
              />
            </>
          )}
          {isFlight ? (
            <View style={[styles.flightDetailsCard, theme.glass.cardWrapperStyle]}>
              <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.flightDetailsBlur, glassStyles.blurContent]}>
                <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
                <View style={styles.flightDetailsContent}>
                  <Text style={[styles.flightDetailsLabel, { color: theme.colors.text.primary }]}>Flight details</Text>
                  <View style={[styles.flightDetailsGrid, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)', borderColor: theme.glass.border }]}>
                    <View style={styles.flightDetailsInputRow}>
                      <View style={styles.flightDetailsInputCol}>
                        <MaterialIcons name="confirmation-number" size={16} color={theme.colors.text.secondary} style={styles.flightDetailsIcon} />
                        <TextInput
                          style={[styles.flightDetailsInput, { color: theme.colors.text.primary }]}
                          value={confirmationCode}
                          onChangeText={setConfirmationCode}
                          placeholder="Conf #"
                          placeholderTextColor={theme.colors.text.tertiary}
                        />
                      </View>
                      <View style={[styles.flightDetailsDivider, { backgroundColor: theme.glass.border }]} />
                      <View style={styles.flightDetailsInputCol}>
                        <MaterialIcons name="meeting-room" size={16} color={theme.colors.text.secondary} style={styles.flightDetailsIcon} />
                        <TextInput
                          style={[styles.flightDetailsInput, { color: theme.colors.text.primary }]}
                          value={terminal}
                          onChangeText={setTerminal}
                          placeholder="Terminal"
                          placeholderTextColor={theme.colors.text.tertiary}
                        />
                      </View>
                    </View>
                    <View style={[styles.flightDetailsRowDivider, { backgroundColor: theme.glass.border }]} />
                    <View style={styles.flightDetailsInputRow}>
                      <View style={styles.flightDetailsInputCol}>
                        <MaterialIcons name="door-sliding" size={16} color={theme.colors.text.secondary} style={styles.flightDetailsIcon} />
                        <TextInput
                          style={[styles.flightDetailsInput, { color: theme.colors.text.primary }]}
                          value={gate}
                          onChangeText={setGate}
                          placeholder="Gate"
                          placeholderTextColor={theme.colors.text.tertiary}
                        />
                      </View>
                      <View style={[styles.flightDetailsDivider, { backgroundColor: theme.glass.border }]} />
                      <View style={styles.flightDetailsInputCol}>
                        <MaterialIcons name="airline-seat-recline-extra" size={16} color={theme.colors.text.secondary} style={styles.flightDetailsIcon} />
                        <TextInput
                          style={[styles.flightDetailsInput, { color: theme.colors.text.primary }]}
                          value={seat}
                          onChangeText={setSeat}
                          placeholder="Seat"
                          placeholderTextColor={theme.colors.text.tertiary}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </AdaptiveGlassView>
            </View>
          ) : (
            <FormInput
              label="Confirmation code"
              value={confirmationCode}
              onChangeText={setConfirmationCode}
              placeholder="Booking reference"
              iconName="confirmation-number"
              variant="glass"
            />
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

        <GlassNavHeader title="Edit reservation" onBackPress={handleBackPress} />
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
  flightDetailsCard: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
    width: '100%',
  },
  flightDetailsBlur: {
    padding: 12,
    position: 'relative' as const,
  },
  flightDetailsContent: {
    position: 'relative' as const,
  },
  flightDetailsLabel: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    marginBottom: spacing.sm,
  },
  flightDetailsGrid: {
    borderRadius: glassConstants.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  flightDetailsInputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    height: 48,
  },
  flightDetailsRowDivider: {
    height: 1,
  },
  flightDetailsInputCol: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    height: '100%' as unknown as number,
  },
  flightDetailsIcon: {
    marginRight: 4,
  },
  flightDetailsInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    height: '100%' as unknown as number,
  },
  flightDetailsDivider: {
    width: 1,
    height: 28,
  },
});
