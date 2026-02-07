import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';

interface SettingsListItemProps {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
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
  const theme = useTheme();
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();

  const content = (
    <View style={variant === 'glass' ? styles.glassContainer : styles.container}>
      <View style={styles.leftContent}>
        {variant === 'glass' ? (
          <AdaptiveGlassView intensity={50} darkIntensity={10} glassEffectStyle="clear" style={[styles.glassIconContainer, glassStyles.blurContentIcon, theme.glass.iconContainerStyle]}>
            <MaterialIcons name={iconName} size={20} color={theme.colors.primary} />
          </AdaptiveGlassView>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}>
            <MaterialIcons name={iconName} size={20} color={theme.colors.primary} />
          </View>
        )}
        <Text style={{
          fontSize: 16,
          fontFamily: fontFamilies.medium,
          color: theme.colors.text.primary,
          flex: 1,
        }}>{label}</Text>
      </View>
      {rightElement || (showChevron && (
        <View style={styles.chevronContainer}>
          <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
        </View>
      ))}
    </View>
  );

  if (variant === 'glass') {
    const wrapper = (
      <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.glassBlur, glassStyles.blurContent]}>
        <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlay }]} pointerEvents="none" />
        {content}
      </AdaptiveGlassView>
    );
    if (onPress) {
      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={[styles.glassPressable, theme.glass.cardWrapperStyle]}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          {wrapper}
        </Pressable>
        </Animated.View>
      );
    }
    return <View style={[styles.glassPressable, theme.glass.cardWrapperStyle]}>{wrapper}</View>;
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
    opacity: 0.7,
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
    padding: 14,
    gap: 14,
    position: 'relative',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
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
    width: 48,
    height: 48,
    borderRadius: glassConstants.radius.icon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassIconContainer: {
    ...glassStyles.iconContainer,
    width: 48,
    height: 48,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronContainer: {
    paddingLeft: spacing.sm,
  },
});
