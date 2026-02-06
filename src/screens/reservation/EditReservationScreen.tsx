import React, { useState, useEffect } from 'react';
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
  Animated,
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
  spacing,
  borderRadius,
  fontFamilies,
  glassStyles,
} from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId, useUpdateReservation, usePressAnimation } from '../../hooks';
import { tripService } from '../../data';
import { formatCalendarDateToLongDisplay, parseToCalendarDate } from '../../utils/dateFormat';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'EditReservation'>;
type EditReservationRouteProp = RouteProp<MainStackParamList, 'EditReservation'>;

export default function EditReservationScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditReservationRouteProp>();
  const insets = useSafeAreaInsets();
  const timelineItemId = route.params?.timelineItemId ?? '';

  const { reservation, isLoading } = useReservationByTimelineId(timelineItemId);
  const { updateReservation, isUpdating } = useUpdateReservation();
  const backAnim = usePressAnimation();
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

      if (reservation.type === 'hotel') {
        // Parse date range from duration (e.g. "February 5, 2025 - February 8, 2025" or "2025-02-05 - 2025-02-08")
        // Same pattern as flight: pre-populate from existing data when editing
        let parsedStart: string | null = null;
        let parsedEnd: string | null = null;
        const duration = reservation.duration?.trim();
        if (duration) {
          const parts = duration.split(/\s*[-–—]\s*/); // hyphen, en-dash, em-dash
          if (parts.length >= 2) {
            parsedStart = parseToCalendarDate(parts[0].trim());
            parsedEnd = parseToCalendarDate(parts[1].trim());
          } else {
            parsedStart = parseToCalendarDate(duration);
            parsedEnd = parsedStart;
          }
        }
        // Fallback: use reservation.date when duration is empty (same as flight uses date directly)
        if (!parsedStart && reservation.date) {
          parsedStart = parseToCalendarDate(reservation.date);
          parsedEnd = parsedStart;
        }
        if (parsedStart) setCheckInDate(parsedStart);
        if (parsedEnd) setCheckOutDate(parsedEnd);
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

      // Use hook for reservation update instead of direct service call
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
        await tripService.updateTimelineItem(timelineItemId, {
          title: providerName,
          date: finalDate,
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
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <View style={[styles.headerContainer, { top: topOffset }]}>
            <BlurView intensity={24} tint={theme.blurTint} style={[styles.headerBlur, glassStyles.blurContentLarge]}>
              <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />
              <View style={styles.headerContent}>
                <Pressable style={styles.backButton} onPress={handleBackPress}>
                  <MaterialIcons name="arrow-back" size={22} color={theme.colors.text.primary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Edit reservation</Text>
                <View style={styles.headerSpacer} />
              </View>
            </BlurView>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  const isFlight = reservation.type === 'flight';
  const isHotel = reservation.type === 'hotel';

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
          {isFlight ? (
            <View style={styles.flightDetailsCard}>
              <BlurView intensity={24} tint={theme.blurTint} style={[styles.flightDetailsBlur, glassStyles.blurContent]}>
                <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />
                <View style={styles.flightDetailsContent}>
                  <Text style={[styles.flightDetailsLabel, { color: theme.colors.text.primary }]}>Flight details</Text>
                  <View style={[styles.flightDetailsGrid, { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: theme.glassColors.border }]}>
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
                      <View style={[styles.flightDetailsDivider, { backgroundColor: theme.glassColors.border }]} />
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
                    <View style={[styles.flightDetailsRowDivider, { backgroundColor: theme.glassColors.border }]} />
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
                      <View style={[styles.flightDetailsDivider, { backgroundColor: theme.glassColors.border }]} />
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
              </BlurView>
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

        <View style={[styles.headerContainer, { top: topOffset }]}>
          <BlurView intensity={24} tint={theme.blurTint} style={[styles.headerBlur, glassStyles.blurContentLarge]}>
            <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />
            <View style={styles.headerContent}>
              <Animated.View style={{ transform: [{ scale: backAnim.scaleAnim }] }}>
              <Pressable
                style={styles.backButton}
                onPress={handleBackPress}
                onPressIn={backAnim.onPressIn}
                onPressOut={backAnim.onPressOut}
                accessibilityLabel="Go back"
              >
                <MaterialIcons name="arrow-back" size={22} color={theme.colors.text.primary} />
              </Pressable>
              </Animated.View>
              <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Edit reservation</Text>
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
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
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
    borderRadius: borderRadius.md,
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
