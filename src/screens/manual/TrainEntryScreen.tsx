import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import {
  colors,
  spacing,
  fontFamilies,
  glassStyles,
  glassColors,
} from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { reservationService, tripService } from '../../data';
import { DEFAULT_RESERVATION_HEADER_IMAGE } from '../../constants/reservationDefaults';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'TrainEntry'>;
type TrainEntryRouteProp = RouteProp<MainStackParamList, 'TrainEntry'>;

export default function TrainEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrainEntryRouteProp>();
  const insets = useSafeAreaInsets();
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

  const topOffset = insets.top + 8;

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

  const handleBackPress = () => navigation.goBack();

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
            label="Operator"
            value={operator}
            onChangeText={setOperator}
            placeholder="e.g. SNCF, Amtrak"
            iconName="train"
            variant="glass"
          />
          <FormInput
            label="Train number"
            value={trainNumber}
            onChangeText={setTrainNumber}
            placeholder="e.g. TGV 6789"
            iconName="confirmation-number"
            variant="glass"
          />
          <FormInput
            label="Route"
            value={routeText}
            onChangeText={setRouteText}
            placeholder="e.g. Paris → Lyon"
            iconName="route"
            variant="glass"
          />
          <DatePickerInput
            label="Date"
            value={date}
            onChange={setDate}
            placeholder="Tap to select date"
            iconName="event"
            variant="glass"
          />
          <FormInput
            label="Time"
            value={time}
            onChangeText={setTime}
            placeholder="e.g. 09:30 AM"
            iconName="schedule"
            variant="glass"
          />
          <FormInput
            label="Seat"
            value={seat}
            onChangeText={setSeat}
            placeholder="e.g. Car 4, 12A"
            iconName="airline-seat-recline-extra"
            variant="glass"
          />
          <FormInput
            label="Confirmation number"
            value={confirmationNumber}
            onChangeText={setConfirmationNumber}
            placeholder="Booking reference"
            iconName="badge"
            variant="glass"
          />

          <ShimmerButton
            label="Save Train"
            iconName="train"
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
              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                onPress={handleBackPress}
                accessibilityLabel="Go back"
              >
                <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
              </Pressable>
              <Text style={styles.headerTitle}>Train Details</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
});
