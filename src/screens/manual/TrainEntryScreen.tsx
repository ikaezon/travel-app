import React, { useState, useCallback } from 'react';
import {
  View,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { TimePickerInput } from '../../components/ui/TimePickerInput';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { KeyboardAwareScrollView } from '../../components/ui/KeyboardAwareScrollView';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { spacing, glassStyles } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { createTrainReservation } from '../../data';
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'TrainEntry'>;
type TrainEntryRouteProp = RouteProp<MainStackParamList, 'TrainEntry'>;

export default function TrainEntryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrainEntryRouteProp>();
  const insets = useSafeAreaInsets();
  const tripId = route.params?.tripId ?? '';

  const [operator, setOperator] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [routeText, setRouteText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topOffset = insets.top + 8;

  const handleSave = async () => {
    Keyboard.dismiss();

    const routeParts = routeText.split(/\s*[→\-–—]\s*|\s+to\s+/i).map((s) => s.trim());
    const departureStation = routeParts[0] || '';
    const arrivalStation = routeParts[1] || '';

    setIsSubmitting(true);
    try {
      await createTrainReservation({
        tripId,
        operator,
        trainNumber,
        departureStation,
        arrivalStation,
        departureDate: date,
        departureTime: time,
        confirmationNumber,
      });

      navigation.goBack();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save train. Try again.';
      Alert.alert('Error', message, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

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
            {
              paddingTop: topOffset + 72,
              paddingBottom: spacing.xxl,
            },
          ]}
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
          <TimePickerInput
            label="Time"
            value={time}
            onChange={setTime}
            placeholder="Tap to select time"
            iconName="schedule"
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
        </KeyboardAwareScrollView>

        <GlassNavHeader
          title="Train Details"
          onBackPress={handleBackPress}
        />
      </View>
    </LinearGradient>
  );
}

