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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
import { colors, spacing, borderRadius } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId } from '../../hooks';
import { reservationService } from '../../data';
import { formatCalendarDateToLongDisplay, parseToCalendarDate } from '../../utils/dateFormat';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'EditReservation'>;
type EditReservationRouteProp = RouteProp<MainStackParamList, 'EditReservation'>;

export default function EditReservationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditReservationRouteProp>();
  const reservationId = route.params?.reservationId ?? '';

  const { reservation, isLoading } = useReservationByTimelineId(reservationId);
  const [providerName, setProviderName] = useState('');
  const [routeText, setRouteText] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [terminal, setTerminal] = useState('');
  const [gate, setGate] = useState('');
  const [seat, setSeat] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reservation) {
      setProviderName(reservation.providerName);
      setRouteText(reservation.route);
      setDate(reservation.date);
      setDuration(reservation.duration);
      setConfirmationCode(reservation.confirmationCode);
      setTerminal(reservation.terminal ?? '');
      setGate(reservation.gate ?? '');
      setSeat(reservation.seat ?? '');
      
      // For hotel reservations, parse date range from duration (supports "YYYY-MM-DD - YYYY-MM-DD" or "February 26, 2026 - March 2, 2026")
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
      // For hotel reservations, save in display format "February 26, 2026"
      let finalDate = date;
      let finalDuration = duration;
      if (reservation.type === 'hotel' && checkInDate && checkOutDate) {
        const startDisplay = formatCalendarDateToLongDisplay(checkInDate);
        const endDisplay = formatCalendarDateToLongDisplay(checkOutDate);
        finalDuration = checkInDate === checkOutDate ? startDisplay : `${startDisplay} - ${endDisplay}`;
        finalDate = startDisplay;
      }
      
      const updated = await reservationService.updateReservation(reservation.id, {
        providerName,
        route: routeText,
        date: finalDate,
        duration: finalDuration,
        confirmationCode,
        terminal: terminal || undefined,
        gate: gate || undefined,
        seat: seat || undefined,
      });
      if (updated) {
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

  if (isLoading || !reservation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.title}>Edit reservation</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isFlight = reservation.type === 'flight';
  const isHotel = reservation.type === 'hotel';

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
        <Text style={styles.title}>Edit reservation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxl + keyboardHeight },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput
          label="Provider"
          value={providerName}
          onChangeText={setProviderName}
          placeholder="e.g. Air France"
          iconName="business"
        />
        <FormInput
          label="Route"
          value={routeText}
          onChangeText={setRouteText}
          placeholder="e.g. LAX → CDG"
          iconName="route"
        />
        {isHotel ? (
          <DateRangePickerInput
            label="Check-in / Check-out dates"
            startDate={checkInDate}
            endDate={checkOutDate}
            onRangeChange={handleHotelDateRangeChange}
            placeholder="Tap to select dates"
          />
        ) : (
          <>
            <DatePickerInput
              label="Date"
              value={date}
              onChange={setDate}
              placeholder="Tap to select date"
              iconName="event"
            />
            <FormInput
              label="Duration"
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g. 11h 20m"
              iconName="schedule"
            />
          </>
        )}
        <FormInput
          label="Confirmation code"
          value={confirmationCode}
          onChangeText={setConfirmationCode}
          placeholder="Booking reference"
          iconName="confirmation-number"
        />
        {isFlight && (
          <>
            <FormInput
              label="Terminal"
              value={terminal}
              onChangeText={setTerminal}
              placeholder="e.g. 2"
              iconName="meeting-room"
            />
            <FormInput
              label="Gate"
              value={gate}
              onChangeText={setGate}
              placeholder="e.g. B12"
              iconName="door-sliding"
            />
            <FormInput
              label="Seat"
              value={seat}
              onChangeText={setSeat}
              placeholder="e.g. 14A"
              iconName="airline-seat-recline-extra"
            />
          </>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save changes</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
