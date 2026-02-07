import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { borderRadius, spacing, fontFamilies, glassStyles } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';

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
  rightIconColor,
  isDashed = false,
  labelRight,
  style,
  variant = 'default',
}: FormInputProps) {
  const theme = useTheme();
  const defaultRightIconColor = rightIconColor ?? theme.colors.status.success;
  const content = (
    <>
      <View style={styles.labelContainer}>
        <Text style={[
          { fontSize: 14, fontFamily: fontFamilies.medium, color: theme.colors.text.secondary },
          variant === 'glass' && { color: theme.colors.text.primary }
        ]}>{label}</Text>
        {labelRight}
      </View>
      <View style={styles.inputContainer}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={20}
            color={theme.colors.text.secondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            {
              width: '100%',
              height: 56,
              borderRadius: borderRadius.md,
              borderWidth: 1,
              borderColor: variant === 'glass' ? theme.glass.border : theme.colors.border,
              backgroundColor: variant === 'glass' ? theme.glass.iconBg : theme.colors.surface,
              paddingHorizontal: spacing.lg,
              fontSize: 16,
              fontFamily: fontFamilies.regular,
              color: theme.colors.text.primary,
            },
            iconName && styles.inputWithLeftIcon,
            rightIconName && styles.inputWithRightIcon,
            isDashed && { borderStyle: 'dashed' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
        />
        {rightIconName && (
          <MaterialIcons
            name={rightIconName}
            size={20}
            color={defaultRightIconColor}
            style={styles.rightIcon}
          />
        )}
      </View>
    </>
  );

  if (variant === 'glass') {
    return (
      <View style={[styles.glassWrapper, theme.glass.cardWrapperStyle, style]}>
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.glassBlur, glassStyles.blurContent]}>
          <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
          <View style={styles.glassContent}>{content}</View>
        </AdaptiveGlassView>
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
  inputContainer: {
    position: 'relative',
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
