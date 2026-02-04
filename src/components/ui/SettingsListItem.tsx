import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';

interface SettingsListItemProps {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

export function SettingsListItem({
  label,
  iconName,
  onPress,
  rightElement,
  showChevron = true,
}: SettingsListItemProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={iconName} size={20} color={colors.primary} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      {rightElement || (showChevron && (
        <View style={styles.chevronContainer}>
          <MaterialIcons name="chevron-right" size={20} color={colors.text.tertiary.light} />
        </View>
      ))}
    </View>
  );

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
    paddingHorizontal: spacing.xxl,
    minHeight: 56,
    gap: spacing.lg,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary.light,
    flex: 1,
  },
  chevronContainer: {
    paddingLeft: spacing.sm,
  },
});
