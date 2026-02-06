import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamilies, glassStyles, glassColors } from '../../theme';

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
          <Pressable
            style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
            onPress={onBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
          </Pressable>

          <View style={styles.titleContainer}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {rightAction && showRightAction ? (
            <Pressable
              style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
              onPress={rightAction.onPress}
              accessibilityLabel={rightAction.accessibilityLabel}
              accessibilityRole="button"
            >
              <MaterialIcons
                name={rightAction.icon}
                size={22}
                color={colors.text.primary.light}
              />
            </Pressable>
          ) : (
            <View style={styles.navButton} />
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
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonPressed: {
    opacity: 0.6,
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
