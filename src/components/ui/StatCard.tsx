import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';

interface StatCardProps {
  label: string;
  value: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

export function StatCard({ label, value, iconName, onPress }: StatCardProps) {
  const theme = useTheme();
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name={iconName} size={20} color={theme.colors.text.secondary} />
        <Text style={{
          flex: 1,
          fontSize: 12,
          fontFamily: fontFamilies.semibold,
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: theme.colors.text.secondary,
        }} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={{
        fontSize: 24,
        fontFamily: fontFamilies.semibold,
        color: theme.colors.text.primary,
        letterSpacing: -0.5,
        lineHeight: 28,
      }} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, minWidth: 0 }}>
      <Pressable
        style={[styles.cardWrapper, !theme.isDark && { borderColor: theme.glassColors.border }, theme.isDark && { borderWidth: 0 }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" absoluteFill style={glassStyles.blurContent} />
        <View style={[styles.cardOverlay, { backgroundColor: theme.isDark ? 'rgba(40, 40, 45, 0.35)' : theme.glassColors.overlayStrong }]} pointerEvents="none" />
        {content}
      </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.cardWrapper, !theme.isDark && { borderColor: theme.glassColors.border }, theme.isDark && { borderWidth: 0 }]} accessibilityLabel={`${label}: ${value}`}>
      <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" absoluteFill style={glassStyles.blurContent} />
      <View style={[styles.cardOverlay, { backgroundColor: theme.isDark ? 'rgba(40, 40, 45, 0.35)' : theme.glassColors.overlayStrong }]} pointerEvents="none" />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    ...glassStyles.cardWrapper,
    flex: 1,
    minWidth: 0,
    borderWidth: glassConstants.borderWidth.cardThin,
    position: 'relative',
  },
  cardOverlay: {
    ...glassStyles.cardOverlay,
  },
  container: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
});
