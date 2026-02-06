import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, fontFamilies, glassStyles, glassColors } from '../../theme';
import { usePressAnimation } from '../../hooks';

interface SettingsListItemProps {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  /** Use liquid glass card styling (for Profile screen) */
  variant?: 'default' | 'glass';
}

export function SettingsListItem({
  label,
  iconName,
  onPress,
  rightElement,
  showChevron = true,
  variant = 'default',
}: SettingsListItemProps) {
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();

  const content = (
    <View style={variant === 'glass' ? styles.glassContainer : styles.container}>
      <View style={styles.leftContent}>
        {variant === 'glass' ? (
          <BlurView intensity={50} tint="light" style={[styles.glassIconContainer, glassStyles.blurContentIcon]}>
            <MaterialIcons name={iconName} size={20} color={colors.primary} />
          </BlurView>
        ) : (
          <View style={styles.iconContainer}>
            <MaterialIcons name={iconName} size={20} color={colors.primary} />
          </View>
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
      {rightElement || (showChevron && (
        <View style={styles.chevronContainer}>
          <MaterialIcons name="chevron-right" size={20} color={colors.text.tertiary.light} />
        </View>
      ))}
    </View>
  );

  if (variant === 'glass') {
    const wrapper = (
      <BlurView intensity={24} tint="light" style={[styles.glassBlur, glassStyles.blurContent]}>
        <View style={styles.glassOverlay} pointerEvents="none" />
        {content}
      </BlurView>
    );
    if (onPress) {
      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={styles.glassPressable}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          {wrapper}
        </Pressable>
        </Animated.View>
      );
    }
    return <View style={styles.glassPressable}>{wrapper}</View>;
  }

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: 56,
  },
  pressed: {
    backgroundColor: colors.background.light,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    minHeight: 56,
    gap: spacing.lg,
  },
  glassPressable: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
  },
  glassBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    gap: 12,
    position: 'relative',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    gap: spacing.lg,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassIconContainer: {
    ...glassStyles.iconContainer,
    width: 40,
    height: 40,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: fontFamilies.medium,
    color: colors.text.primary.light,
    flex: 1,
  },
  chevronContainer: {
    paddingLeft: spacing.sm,
  },
});
