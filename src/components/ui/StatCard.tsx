import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, fontFamilies, glassStyles, glassColors, glassConstants } from '../../theme';

interface StatCardProps {
  label: string;
  value: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

export function StatCard({ label, value, iconName, onPress }: StatCardProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name={iconName} size={20} color={colors.text.secondary.light} />
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.cardWrapper,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        <BlurView intensity={24} tint="light" style={[StyleSheet.absoluteFill, glassStyles.blurContent]} />
        <View style={styles.cardOverlay} pointerEvents="none" />
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.cardWrapper} accessibilityLabel={`${label}: ${value}`}>
      <BlurView intensity={24} tint="light" style={[StyleSheet.absoluteFill, glassStyles.blurContent]} />
      <View style={styles.cardOverlay} pointerEvents="none" />
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
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
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
  label: {
    flex: 1,
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.secondary.light,
  },
  value: {
    fontSize: 24,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
});
