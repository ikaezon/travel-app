import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, fontFamilies } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

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
  const theme = useTheme();
  return (
    <View style={[
      styles.container,
      showBorder && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
    ]}>
      <Text style={{
        fontSize: 14,
        fontFamily: fontFamilies.regular,
        color: theme.colors.text.secondary,
        flexShrink: 0,
      }}>{label}</Text>
      <View style={styles.valueWrapper}>
        <Text
          style={[
            {
              fontSize: 14,
              fontFamily: fontFamilies.semibold,
              color: theme.colors.text.primary,
              textAlign: 'right',
            },
            valueColor && { color: valueColor },
            isMonospace && styles.monospace,
          ]}
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      </View>
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
  valueWrapper: {
    flex: 1,
    minWidth: 0,
  },
  monospace: {
    fontFamily: 'Courier',
    letterSpacing: 1,
  },
});
