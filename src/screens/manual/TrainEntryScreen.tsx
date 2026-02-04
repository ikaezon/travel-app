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
import { colors, spacing, borderRadius } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { reservationService, tripService } from '../../data';
import { DEFAULT_RESERVATION_HEADER_IMAGE } from '../../constants/reservationDefaults';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'TrainEntry'>;
type TrainEntryRouteProp = RouteProp<MainStackParamList, 'TrainEntry'>;

export default function TrainEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrainEntryRouteProp>();
  const tripId = route.params?.tripId ?? '';

  const [operator, setOperator] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [routeText, setRouteText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seat, setSeat] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const providerName = operator.trim() || 'Train';
    const title = [providerName, trainNumber.trim()].filter(Boolean).join(' ') || 'Train';
    const subtitle = routeText.trim() || 'TBD';
    const dateVal = date.trim() || 'TBD';
    const timeVal = time.trim() || 'TBD';

    setIsSubmitting(true);
    try {
      await reservationService.createReservation({
        tripId,
        type: 'train',
        providerName,
        route: subtitle,
        date: dateVal,
        duration: '',
        status: 'confirmed',
        confirmationCode: confirmationNumber.trim() || '—',
        statusText: 'On Time',
        headerImageUrl: DEFAULT_RESERVATION_HEADER_IMAGE,
        seat: seat.trim() || undefined,
        attachments: [],
      });

      await tripService.createTimelineItem(tripId, {
        type: 'train',
        date: dateVal,
        time: timeVal,
        title,
        subtitle,
        metadata: seat.trim() ? `Seat: ${seat.trim()}` : undefined,
        actionLabel: 'View Ticket',
        actionIcon: 'confirmation-number',
      });

      setIsSubmitting(false);
      navigation.goBack();
    } catch (err) {
      setIsSubmitting(false);
      const message =
        err instanceof Error ? err.message : 'Could not save train. Try again.';
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
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.text.primary.light}
          />
        </Pressable>
        <Text style={styles.title}>Train Details</Text>
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
          label="Operator"
          value={operator}
          onChangeText={setOperator}
          placeholder="e.g. SNCF, Amtrak"
          iconName="train"
        />
        <FormInput
          label="Train number"
          value={trainNumber}
          onChangeText={setTrainNumber}
          placeholder="e.g. TGV 6789"
          iconName="confirmation-number"
        />
        <FormInput
          label="Route"
          value={routeText}
          onChangeText={setRouteText}
          placeholder="e.g. Paris → Lyon"
          iconName="route"
        />
        <DatePickerInput
          label="Date"
          value={date}
          onChange={setDate}
          placeholder="Tap to select date"
          iconName="event"
        />
        <FormInput
          label="Time"
          value={time}
          onChangeText={setTime}
          placeholder="e.g. 09:30 AM"
          iconName="schedule"
        />
        <FormInput
          label="Seat"
          value={seat}
          onChangeText={setSeat}
          placeholder="e.g. Car 4, 12A"
          iconName="airline-seat-recline-extra"
        />
        <FormInput
          label="Confirmation number"
          value={confirmationNumber}
          onChangeText={setConfirmationNumber}
          placeholder="Booking reference"
          iconName="badge"
        />

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (pressed || isSubmitting) && styles.saveButtonPressed,
          ]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Train</Text>
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
