import React, { useState, useEffect, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DestinationAutocomplete } from '../../components/ui/DestinationAutocomplete';
import { FormInput } from '../../components/ui/FormInput';
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
import { colors, spacing, borderRadius } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useCreateTrip } from '../../hooks';
import { formatCalendarDateToDisplay, daysBetween } from '../../utils/dateFormat';
import type { Trip } from '../../types';

const DEFAULT_IMAGE_URL =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';

function formatDateRangeDisplay(startDate: string, endDate: string): string {
  const startStr = formatCalendarDateToDisplay(startDate);
  const endStr = formatCalendarDateToDisplay(endDate);
  return startDate === endDate ? startStr : `${startStr} - ${endStr}`;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'CreateTrip'>;

export default function CreateTripScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { createTrip, isSubmitting } = useCreateTrip();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const dateRangeDisplay = useMemo(() => {
    if (!startDate) return '';
    if (!endDate) return formatDateRangeDisplay(startDate, startDate);
    return formatDateRangeDisplay(startDate, endDate);
  }, [startDate, endDate]);

  const durationLabel = useMemo(() => {
    if (!startDate) return '';
    const end = endDate ?? startDate;
    const days = daysBetween(startDate, end);
    return days === 1 ? '1 Day' : `${days} Days`;
  }, [startDate, endDate]);

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

    const trimmedDestination = destination.trim();

    if (!trimmedDestination) {
      Alert.alert('Missing field', 'Please enter a destination.');
      return;
    }

    try {
      const dateRangeValue = dateRangeDisplay?.trim() || 'TBD';
      const durationLabelValue = durationLabel?.trim() || 'TBD';

      const tripData: Omit<Trip, 'id'> = {
        destination: trimmedDestination,
        dateRange: dateRangeValue,
        durationLabel: durationLabelValue,
        imageUrl: imageUrl.trim() || DEFAULT_IMAGE_URL,
        status: 'upcoming',
        iconName: 'airplane-ticket',
      };

      const newTrip = await createTrip(tripData);

      navigation.replace('TripOverview', {
        tripId: newTrip.id,
        tripName: newTrip.destination,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not create trip. Try again.';
      Alert.alert('Error', message, [{ text: 'OK' }]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => !isSubmitting && navigation.goBack()}
          accessibilityLabel="Go back"
          disabled={isSubmitting}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.text.primary.light}
          />
        </Pressable>
        <Text style={styles.title}>New Trip</Text>
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
        <DestinationAutocomplete
          label="Destination"
          value={destination}
          onChangeText={setDestination}
          placeholder="e.g. Paris, France or Tokyo, Japan"
        />

        <DateRangePickerInput
          label="Date range"
          startDate={startDate}
          endDate={endDate}
          onRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          placeholder="Tap to select dates"
        />

        <FormInput
          label="Cover image URL (optional)"
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="Leave blank for default"
          iconName="image"
        />

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (pressed || isSubmitting) && styles.saveButtonPressed,
            isSubmitting && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Create Trip</Text>
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
    minHeight: 52,
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
