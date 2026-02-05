import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, fontFamilies, glassStyles, glassColors } from '../../theme';

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
  /** Use liquid glass card styling */
  variant?: 'default' | 'glass';
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
  variant = 'default',
}: FormInputProps) {
  const content = (
    <>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, variant === 'glass' && styles.labelGlass]}>{label}</Text>
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
            variant === 'glass' && styles.inputGlass,
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
    </>
  );

  if (variant === 'glass') {
    return (
      <View style={[styles.glassWrapper, style]}>
        <BlurView intensity={24} tint="light" style={[styles.glassBlur, glassStyles.blurContent]}>
          <View style={styles.glassOverlay} pointerEvents="none" />
          <View style={styles.glassContent}>{content}</View>
        </BlurView>
      </View>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  glassWrapper: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
    width: '100%',
  },
  glassBlur: {
    padding: 12,
    position: 'relative',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  glassContent: {
    position: 'relative',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary.light,
  },
  labelGlass: {
    color: colors.text.primary.light,
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
    fontFamily: fontFamilies.regular,
    color: colors.text.primary.light,
  },
  inputGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: glassColors.border,
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
