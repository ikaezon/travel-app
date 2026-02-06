import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Keyboard,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DestinationAutocomplete } from '../../components/ui/DestinationAutocomplete';
import { FormInput } from '../../components/ui/FormInput';
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
import { useCreateTrip, usePressAnimation } from '../../hooks';
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
  const insets = useSafeAreaInsets();
  const { createTrip, isSubmitting } = useCreateTrip();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const topOffset = insets.top + 8;
  const backAnim = usePressAnimation();

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

  const handleBackPress = () => {
    if (!isSubmitting) navigation.goBack();
  };

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

        <View style={[styles.headerContainer, { top: topOffset }]}>
          <BlurView intensity={24} tint="light" style={[styles.headerBlur, glassStyles.blurContentLarge]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.headerContent}>
              <Animated.View style={{ transform: [{ scale: backAnim.scaleAnim }] }}>
              <Pressable
                style={styles.backButton}
                onPress={handleBackPress}
                onPressIn={backAnim.onPressIn}
                onPressOut={backAnim.onPressOut}
                accessibilityLabel="Go back"
                disabled={isSubmitting}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={22}
                  color={colors.text.primary.light}
                />
              </Pressable>
              </Animated.View>
              <Text style={styles.headerTitle}>New Trip</Text>
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
  headerTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
});
