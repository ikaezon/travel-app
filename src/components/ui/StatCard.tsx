import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { borderRadius, colors, spacing } from '../../theme';

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
          styles.pressable,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.pressable} accessibilityLabel={`${label}: ${value}`}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    transform: [{ scale: 1.02 }],
  },
  container: {
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
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
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.secondary.light,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
});
