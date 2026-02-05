import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontFamilies } from '../../theme';

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  isMonospace?: boolean;
  showBorder?: boolean;
}

export function DetailRow({
  label,
  value,
  valueColor,
  isMonospace = false,
  showBorder = true,
}: DetailRowProps) {
  return (
    <View style={[styles.container, showBorder && styles.borderBottom]}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          valueColor && { color: valueColor },
          isMonospace && styles.monospace,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
  },
  value: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    textAlign: 'right',
  },
  monospace: {
    fontFamily: 'Courier',
    letterSpacing: 1,
  },
});
