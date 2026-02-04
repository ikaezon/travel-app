import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { MainStackParamList } from '../../navigation/types';
import { mockImages, mockReviewDetailsDefaults } from '../../data/mocks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type ReviewDetailsRouteProp = RouteProp<MainStackParamList, 'ReviewDetails'>;

interface ParsedData {
  airline: string;
  flightNumber: string;
  date: string;
  time: string;
  confirmationCode: string;
}

interface ReviewDetailsScreenProps {
  initialData?: Partial<ParsedData>;
}

export default function ReviewDetailsScreen({
  initialData = {},
}: ReviewDetailsScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReviewDetailsRouteProp>();
  const sourceImageUrl = route.params?.imageUri || mockImages.defaultReviewImage;

  const defaults = mockReviewDetailsDefaults as ParsedData;
  const [formData, setFormData] = useState<ParsedData>({
    airline: initialData.airline ?? defaults.airline,
    flightNumber: initialData.flightNumber ?? defaults.flightNumber,
    date: initialData.date ?? defaults.date,
    time: initialData.time ?? defaults.time,
    confirmationCode: initialData.confirmationCode ?? defaults.confirmationCode,
  });
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleConfirm = () => {
    navigation.navigate('Tabs');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#111618" />
        </Pressable>
        <Text style={styles.headerTitle}>Review Details</Text>
        <Pressable style={styles.helpButton}>
          <Text style={styles.helpText}>Help</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + keyboardHeight },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sourceSection}>
          <View style={styles.sourceCard}>
            <View style={styles.sourceInfo}>
              <View style={styles.sourceHeader}>
                <MaterialIcons name="document-scanner" size={20} color="#13a4ec" />
                <Text style={styles.sourceLabel}>SOURCE</Text>
              </View>
              <Text style={styles.sourceTitle}>Original Screenshot</Text>
              <Text style={styles.sourceSubtitle}>
                Tap to expand and verify details
              </Text>
            </View>

            <Pressable style={styles.thumbnailContainer}>
              <ImageBackground
                source={{ uri: sourceImageUrl }}
                style={styles.thumbnail}
                imageStyle={styles.thumbnailImage}
              >
                <View style={styles.thumbnailOverlay}>
                  <MaterialIcons name="zoom-in" size={24} color="white" />
                </View>
              </ImageBackground>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Flight Information</Text>
          <Text style={styles.sectionSubtitle}>
            AI has auto-filled these details. Please verify.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <FormInput
            label="Airline"
            value={formData.airline}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, airline: text }))
            }
            iconName="flight"
            rightIconName="check-circle"
            rightIconColor="#10b981"
          />

          <FormInput
            label="Flight Number"
            value={formData.flightNumber}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, flightNumber: text }))
            }
            iconName="pin"
            rightIconName="check-circle"
            rightIconColor="#10b981"
          />

          <View style={styles.rowContainer}>
            <DatePickerInput
              label="Date"
              value={formData.date}
              onChange={(text) =>
                setFormData((prev) => ({ ...prev, date: text }))
              }
              placeholder="Tap to select date"
              iconName="calendar-today"
              style={styles.halfWidth}
            />
            <FormInput
              label="Time"
              value={formData.time}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, time: text }))
              }
              iconName="schedule"
              style={styles.halfWidth}
            />
          </View>

          <FormInput
            label="Confirmation Code"
            value={formData.confirmationCode}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, confirmationCode: text }))
            }
            placeholder="e.g. G7K9L2"
            iconName="confirmation-number"
            isDashed
            style={styles.topMargin}
            labelRight={
              <Pressable>
                <Text style={styles.labelLink}>Not found?</Text>
              </Pressable>
            }
          />
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.confirmButtonPressed,
          ]}
          onPress={handleConfirm}
        >
          <MaterialIcons name="check" size={24} color="white" />
          <Text style={styles.confirmButtonText}>Confirm &amp; Save</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#dbe2e6',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111618',
    letterSpacing: -0.3,
    paddingRight: 8,
  },
  helpButton: {
    paddingHorizontal: 4,
  },
  helpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#13a4ec',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom is now dynamic based on keyboard
  },
  sourceSection: {
    padding: 16,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe2e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sourceInfo: {
    flex: 3,
    gap: 4,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#617c89',
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111618',
    lineHeight: 18,
  },
  sourceSubtitle: {
    fontSize: 12,
    color: '#617c89',
    lineHeight: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dbe2e6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailImage: {
    borderRadius: 8,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111618',
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#617c89',
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  topMargin: {
    marginTop: 8,
  },
  labelLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#13a4ec',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#dbe2e6',
  },
  confirmButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    backgroundColor: '#13a4ec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#13a4ec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});
