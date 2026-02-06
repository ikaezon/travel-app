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
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormInput } from '../../components/ui/FormInput';
import { DatePickerInput } from '../../components/ui/DatePickerInput';
import { TimePickerInput } from '../../components/ui/TimePickerInput';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { MainStackParamList } from '../../navigation/types';
import { fontFamilies, glassStyles } from '../../theme';
import { mockImages, mockReviewDetailsDefaults } from '../../data/mocks';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

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
  const theme = useTheme();
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
  const sourceAnim = usePressAnimation();
  const backAnim = usePressAnimation();
  const helpAnim = usePressAnimation();

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
            {
              paddingTop: topOffset + 72,
              paddingBottom: 120 + keyboardHeight,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sourceSection}>
            <Animated.View style={{ transform: [{ scale: sourceAnim.scaleAnim }] }}>
            <Pressable style={styles.sourceCard} onPressIn={sourceAnim.onPressIn} onPressOut={sourceAnim.onPressOut}>
              <BlurView intensity={24} tint={theme.blurTint} style={[StyleSheet.absoluteFill, glassStyles.blurContent]} />
              <View style={styles.sourceCardInner}>
                <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />
                <View style={styles.sourceContent}>
                <View style={styles.sourceInfo}>
                  <View style={styles.sourceHeader}>
                    <MaterialIcons name="document-scanner" size={20} color={theme.colors.primary} />
                    <Text style={[styles.sourceLabel, { color: theme.colors.text.secondary }]}>SOURCE</Text>
                  </View>
                  <Text style={[styles.sourceTitle, { color: theme.colors.text.primary }]}>Original Screenshot</Text>
                  <Text style={[styles.sourceSubtitle, { color: theme.colors.text.secondary }]}>
                    Tap to expand and verify details
                  </Text>
                </View>
                <Pressable style={[styles.thumbnailContainer, { borderColor: theme.glassColors.border }]}>
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
            </Animated.View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Flight Information</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
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
              rightIconColor={theme.colors.status.success}
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
              rightIconColor={theme.colors.status.success}
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
              <TimePickerInput
                label="Time"
                value={formData.time}
                onChange={(text) =>
                  setFormData((prev) => ({ ...prev, time: text }))
                }
                placeholder="Tap to select"
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
                  <Text style={[styles.labelLink, { color: theme.colors.primary }]}>Not found?</Text>
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
          <BlurView intensity={24} tint={theme.blurTint} style={[styles.headerBlur, glassStyles.blurContentLarge]}>
            <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />
            <View style={styles.headerContent}>
              <Animated.View style={{ transform: [{ scale: backAnim.scaleAnim }] }}>
              <Pressable
                style={styles.headerButton}
                onPress={handleBackPress}
                onPressIn={backAnim.onPressIn}
                onPressOut={backAnim.onPressOut}
              >
                <MaterialIcons name="arrow-back" size={22} color={theme.colors.text.primary} />
              </Pressable>
              </Animated.View>
              <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Review Details</Text>
              <Animated.View style={{ transform: [{ scale: helpAnim.scaleAnim }] }}>
              <Pressable style={styles.helpButton} onPressIn={helpAnim.onPressIn} onPressOut={helpAnim.onPressOut}>
                <Text style={[styles.helpText, { color: theme.colors.primary }]}>Help</Text>
              </Pressable>
              </Animated.View>
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
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
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
  },
  sourceTitle: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    lineHeight: 18,
  },
  sourceSubtitle: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    lineHeight: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
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
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
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
