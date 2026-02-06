import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DestinationAutocomplete } from '../../components/ui/DestinationAutocomplete';
import { FormInput } from '../../components/ui/FormInput';
import { DateRangePickerInput } from '../../components/ui/DateRangePickerInput';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useCreateTrip } from '../../hooks';
import { formatCalendarDateToDisplay, daysBetween } from '../../utils/dateFormat';
import { fetchCoverImageForDestination, isCoverImageAvailable } from '../../data/services';
import type { Trip } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

const DEFAULT_IMAGE_URL =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

      // Determine final image URL
      let finalImageUrl = imageUrl.trim();
      if (!finalImageUrl && isCoverImageAvailable()) {
        // Fetch destination-based cover image from Unsplash
        const coverUrl = await fetchCoverImageForDestination(trimmedDestination);
        finalImageUrl = coverUrl || DEFAULT_IMAGE_URL;
      } else if (!finalImageUrl) {
        finalImageUrl = DEFAULT_IMAGE_URL;
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
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topOffset + 72, paddingBottom: spacing.xxl + keyboardHeight },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <DestinationAutocomplete
            label="Destination"
            value={destination}
            onChangeText={setDestination}
            placeholder="e.g. Paris, France or Tokyo, Japan"
            variant="glass"
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
        </ScrollView>

        <GlassNavHeader
          title="New Trip"
          onBackPress={handleBackPress}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
});
