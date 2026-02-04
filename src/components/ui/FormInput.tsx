import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { borderRadius, colors, spacing } from '../../theme';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  rightIconName?: keyof typeof MaterialIcons.glyphMap;
  rightIconColor?: string;
  isDashed?: boolean;
  labelRight?: React.ReactNode;
  style?: ViewStyle;
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  iconName,
  rightIconName,
  rightIconColor = colors.status.success,
  isDashed = false,
  labelRight,
  style,
}: FormInputProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {labelRight}
      </View>
      <View style={styles.inputContainer}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={20}
            color={colors.text.secondary.light}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            iconName && styles.inputWithLeftIcon,
            rightIconName && styles.inputWithRightIcon,
            isDashed && styles.inputDashed,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary.light}
        />
        {rightIconName && (
          <MaterialIcons
            name={rightIconName}
            size={20}
            color={rightIconColor}
            style={styles.rightIcon}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary.light,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.light,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontWeight: '400',
    color: colors.text.primary.light,
  },
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  inputDashed: {
    borderStyle: 'dashed',
  },
  leftIcon: {
    position: 'absolute',
    left: spacing.lg,
    top: 18,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: spacing.lg,
    top: 18,
    zIndex: 1,
  },
});
