import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AddressAutocomplete } from '../../components/ui/AddressAutocomplete';
import { FormInput } from '../../components/ui/FormInput';
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { KeyboardAwareScrollView } from '../../components/ui/KeyboardAwareScrollView';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { spacing, glassStyles } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useCreateTrip } from '../../hooks';
import { formatCalendarDateToDisplay, daysBetween } from '../../utils/dateFormat';
import { fetchCoverImageForDestination, isCoverImageAvailable } from '../../data/services';
import type { Trip } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';



function formatDateRangeDisplay(startDate: string, endDate: string): string {
  const startStr = formatCalendarDateToDisplay(startDate);
  const endStr = formatCalendarDateToDisplay(endDate);
  return startDate === endDate ? startStr : `${startStr} - ${endStr}`;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'CreateTrip'>;

export default function CreateTripScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { createTrip, isSubmitting } = useCreateTrip();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const topOffset = insets.top + 8;

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

      let finalImageUrl = imageUrl.trim();
      if (!finalImageUrl && isCoverImageAvailable()) {
        const coverUrl = await fetchCoverImageForDestination(trimmedDestination);
        finalImageUrl = coverUrl || '';
      }

      const tripData: Omit<Trip, 'id'> = {
        destination: trimmedDestination,
        dateRange: dateRangeValue,
        durationLabel: durationLabelValue,
        imageUrl: finalImageUrl,
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

  const handleBackPress = useCallback(() => {
    if (!isSubmitting) navigation.goBack();
  }, [isSubmitting, navigation]);

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={glassStyles.screenGradient}
    >
      <View style={glassStyles.screenContainer}>
        <KeyboardAwareScrollView
          style={glassStyles.screenScrollView}
          contentContainerStyle={[
            glassStyles.screenScrollContent,
            { paddingTop: topOffset + 72, paddingBottom: spacing.xxl },
          ]}
        >
          <AddressAutocomplete
            label="Destination"
            value={destination}
            onChangeText={setDestination}
            placeholder="e.g. Paris, France or Tokyo, Japan"
            variant="glass"
            type="place"
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
            variant="glass"
          />

          <FormInput
            label="Cover image URL (optional)"
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Leave blank for default"
            iconName="image"
            variant="glass"
          />

          <ShimmerButton
            label="Create Trip"
            iconName="add"
            onPress={handleSave}
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="boardingPass"
          />
        </KeyboardAwareScrollView>

        <GlassNavHeader
          title="New Trip"
          onBackPress={handleBackPress}
        />
      </View>
    </LinearGradient>
  );
}

