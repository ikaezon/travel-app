import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamilies, glassStyles, glassColors } from '../../theme';

// Spring configs matching the bottom tab bar bubble feel
const PRESS_SPRING = { tension: 280, friction: 14, useNativeDriver: true };
const RELEASE_SPRING = { tension: 200, friction: 18, useNativeDriver: true };
const PRESS_SCALE = 1.12;

const BUTTON_SIZE = 36;
const BUTTON_RADIUS = BUTTON_SIZE / 2;

interface GlassNavHeaderProps {
  /** Main title text */
  title: string;
  /** Optional small label above the title */
  label?: string;
  /** Called when back button is pressed */
  onBackPress: () => void;
  /** Optional right-side action button */
  rightAction?: {
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  };
  /** Whether to show the right action (useful for conditional rendering) */
  showRightAction?: boolean;
}

/**
 * Glass bubble button used in the nav header.
 * Matches the look and feel of the bottom tab bar pill.
 */
function GlassNavButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, { ...PRESS_SPRING, toValue: PRESS_SCALE }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, { ...RELEASE_SPRING, toValue: 1 }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.navButtonOuter, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={styles.navButtonPressable}
      >
        <BlurView intensity={45} tint="light" style={styles.navButtonBlur}>
          <View style={styles.navButtonOverlay} pointerEvents="none" />
          <MaterialIcons name={icon} size={22} color={colors.text.primary.light} />
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Shared glassmorphic navigation header used across screens.
 * Positioned absolutely at top with safe area insets.
 */
export function GlassNavHeader({
  title,
  label,
  onBackPress,
  rightAction,
  showRightAction = true,
}: GlassNavHeaderProps) {
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + 8;

  return (
    <View style={[styles.container, { top: topOffset }]}>
      <BlurView
        intensity={24}
        tint="light"
        style={[styles.blurContainer, glassStyles.blurContentLarge]}
      >
        <View style={styles.glassOverlay} pointerEvents="none" />
        <View style={styles.content}>
          <GlassNavButton
            icon="arrow-back"
            onPress={onBackPress}
            accessibilityLabel="Go back"
          />

          <View style={styles.titleContainer}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {rightAction && showRightAction ? (
            <GlassNavButton
              icon={rightAction.icon}
              onPress={rightAction.onPress}
              accessibilityLabel={rightAction.accessibilityLabel}
            />
          ) : (
            <View style={styles.navButtonSpacer} />
          )}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  blurContainer: {
    ...glassStyles.navBarWrapper,
    width: '90%',
    maxWidth: 360,
    position: 'relative',
    height: 56,
    justifyContent: 'center',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navButtonOuter: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_RADIUS,
    overflow: 'hidden',
  },
  navButtonPressable: {
    flex: 1,
  },
  navButtonBlur: {
    flex: 1,
    borderRadius: BUTTON_RADIUS,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: glassColors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  navButtonSpacer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  label: {
    fontSize: 9,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 1,
    opacity: 0.8,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
});
