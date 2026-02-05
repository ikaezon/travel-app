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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { MainStackParamList } from '../../navigation/types';
import { colors, fontFamilies, glassStyles, glassColors } from '../../theme';
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
  const insets = useSafeAreaInsets();
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

  const handleBackPress = () => navigation.goBack();

  const handleConfirm = () => {
    navigation.navigate('Tabs');
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
            {
              paddingTop: topOffset + 72,
              paddingBottom: 120 + keyboardHeight,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sourceSection}>
            <Pressable style={({ pressed }) => [styles.sourceCard, pressed && styles.sourceCardPressed]}>
              <BlurView intensity={24} tint="light" style={[StyleSheet.absoluteFill, glassStyles.blurContent]} />
              <View style={styles.sourceCardInner}>
                <View style={styles.glassOverlay} pointerEvents="none" />
                <View style={styles.sourceContent}>
                <View style={styles.sourceInfo}>
                  <View style={styles.sourceHeader}>
                    <MaterialIcons name="document-scanner" size={20} color={colors.primary} />
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
            </Pressable>
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
              rightIconColor={colors.status.success}
              variant="glass"
            />
            <FormInput
              label="Flight Number"
              value={formData.flightNumber}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, flightNumber: text }))
              }
              iconName="confirmation-number"
              rightIconName="check-circle"
              rightIconColor={colors.status.success}
              variant="glass"
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
                variant="glass"
              />
              <FormInput
                label="Time"
                value={formData.time}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, time: text }))
                }
                iconName="schedule"
                style={styles.halfWidth}
                variant="glass"
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
              variant="glass"
            />
          </View>
        </ScrollView>

        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
          <ShimmerButton
            label="Confirm & Save"
            iconName="check"
            onPress={handleConfirm}
            variant="boardingPass"
          />
        </View>

        <View style={[styles.headerContainer, { top: topOffset }]}>
          <BlurView intensity={24} tint="light" style={[styles.headerBlur, glassStyles.blurContentLarge]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.headerContent}>
              <Pressable
                style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
                onPress={handleBackPress}
              >
                <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
              </Pressable>
              <Text style={styles.headerTitle}>Review Details</Text>
              <Pressable style={styles.helpButton}>
                <Text style={styles.helpText}>Help</Text>
              </Pressable>
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
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  helpButton: {
    paddingHorizontal: 4,
    minWidth: 36,
    alignItems: 'flex-end',
  },
  helpText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  sourceSection: {
    marginBottom: 16,
  },
  sourceCard: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    position: 'relative',
  },
  sourceCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  sourceCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  sourceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  sourceInfo: {
    flex: 1,
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
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.secondary.light,
  },
  sourceTitle: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    lineHeight: 18,
  },
  sourceSubtitle: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    lineHeight: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: glassColors.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailImage: {
    borderRadius: 10,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    marginTop: 4,
  },
  formContainer: {
    gap: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  topMargin: {
    marginTop: 0,
  },
  labelLink: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
