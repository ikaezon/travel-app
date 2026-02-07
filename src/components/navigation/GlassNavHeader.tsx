import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamilies, glassStyles } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from '../ui/AdaptiveGlassView';

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
  const theme = useTheme();

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
        <AdaptiveGlassView intensity={45} glassEffectStyle="clear" style={[styles.navButtonBlur, { borderColor: theme.glass.borderStrong }]}>
          {!theme.isDark && <View style={[styles.navButtonOverlay, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]} pointerEvents="none" />}
          <MaterialIcons name={icon} size={22} color={theme.colors.text.primary} />
        </AdaptiveGlassView>
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
  const theme = useTheme();

  return (
    <View style={[styles.container, { top: topOffset }]}>
      <View style={[styles.barWrapper, theme.glass.navWrapperStyle]}>
        <AdaptiveGlassView
          intensity={24}
          style={styles.blurContainer}
        >
          {!theme.isDark && <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />}
        </AdaptiveGlassView>
        <View style={styles.content}>
          <GlassNavButton
            icon="arrow-back"
            onPress={onBackPress}
            accessibilityLabel="Go back"
          />

          <View style={styles.titleContainer}>
            {label && <Text style={[styles.label, { color: theme.colors.primary }]}>{label}</Text>}
            <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={1}>
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
      </View>
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
  barWrapper: {
    ...glassStyles.navBarWrapper,
    width: '90%',
    maxWidth: 360,
    height: 56,
    position: 'relative',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    ...glassStyles.blurContentLarge,
    zIndex: 0,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 1,
    opacity: 0.8,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    letterSpacing: -0.3,
  },
});
