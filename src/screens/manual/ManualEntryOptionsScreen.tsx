import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  colors,
  spacing,
  fontFamilies,
  glassStyles,
  glassColors,
} from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { usePressAnimation } from '../../hooks';

const MANUAL_ENTRY_OPTIONS = [
  {
    id: 'flight',
    title: 'Flight',
    subtitle: 'Add flight details',
    iconName: 'flight' as const,
    iconColor: colors.reservation.flight.icon,
    iconBgColor: colors.reservation.flight.bg,
    route: 'FlightEntry' as const,
  },
  {
    id: 'lodging',
    title: 'Lodging',
    subtitle: 'Add hotel or stay details',
    iconName: 'hotel' as const,
    iconColor: colors.reservation.hotel.icon,
    iconBgColor: colors.reservation.hotel.bg,
    route: 'LodgingEntry' as const,
  },
];

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

function OptionCard({ option, onPress }: { option: typeof MANUAL_ENTRY_OPTIONS[number]; onPress: () => void }) {
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={styles.optionCardWrapper}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <BlurView intensity={24} tint="light" style={[styles.optionCardBlur, glassStyles.blurContent]}>
          <View style={styles.glassOverlay} pointerEvents="none" />
          <View style={styles.optionCardContent}>
            <View style={[styles.optionIconContainer, { backgroundColor: option.iconBgColor }]}>
              <MaterialIcons name={option.iconName} size={28} color={option.iconColor} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.text.secondary.light} />
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

export default function ManualEntryOptionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + 8;
  const backAnim = usePressAnimation();

  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <View style={[styles.content, { paddingTop: topOffset + 72 }]}>
          <Text style={styles.subtitle}>What would you like to add?</Text>
          <View style={styles.optionsList}>
            {MANUAL_ENTRY_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                onPress={() => navigation.navigate(option.route)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.headerContainer, { top: topOffset }]}>
          <BlurView intensity={24} tint="light" style={[styles.headerBlur, glassStyles.blurContentLarge]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.headerContent}>
              <Animated.View style={{ transform: [{ scale: backAnim.scaleAnim }] }}>
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                onPressIn={backAnim.onPressIn}
                onPressOut={backAnim.onPressOut}
                accessibilityLabel="Go back"
              >
                <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
              </Pressable>
              </Animated.View>
              <Text style={styles.headerTitle}>Manual Entry</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary.light,
    marginBottom: spacing.xl,
  },
  optionsList: {
    gap: 12,
  },
  optionCardWrapper: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
  },
  optionCardBlur: {
    padding: 12,
    position: 'relative',
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    lineHeight: 20,
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    lineHeight: 20,
  },
});
