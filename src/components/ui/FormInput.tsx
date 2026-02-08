import React, { useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { borderRadius, spacing, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';
import { useKeyboardScroll } from './KeyboardAwareScrollView';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  rightIconName?: keyof typeof MaterialIcons.glyphMap;
  rightIconColor?: string;
  showGlassCheck?: boolean;
  isDashed?: boolean;
  labelRight?: React.ReactNode;
  style?: ViewStyle;
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
  showGlassCheck = false,
  isDashed = false,
  labelRight,
  style,
  variant = 'default',
}: FormInputProps) {
  const theme = useTheme();
  const { scrollToInput } = useKeyboardScroll();
  const containerRef = useRef<View>(null);
  const defaultRightIconColor = rightIconColor ?? theme.colors.status.success;
  const hasRightIcon = rightIconName || showGlassCheck;

  const handleFocus = useCallback(() => {
    scrollToInput(containerRef);
  }, [scrollToInput]);
  
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
            hasRightIcon && styles.inputWithRightIcon,
            isDashed && { borderStyle: 'dashed' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={handleFocus}
        />
        {showGlassCheck && (
          <View style={styles.glassCheckContainer}>
            <AdaptiveGlassView
              intensity={40}
              darkIntensity={15}
              glassEffectStyle="clear"
              style={[
                styles.glassCheckBadge,
                { 
                  borderColor: theme.colors.status.success,
                  backgroundColor: `${theme.colors.status.success}20`,
                },
              ]}
            >
              <MaterialIcons
                name="check"
                size={10}
                color={theme.colors.status.success}
              />
            </AdaptiveGlassView>
          </View>
        )}
        {rightIconName && !showGlassCheck && (
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
      <View ref={containerRef} style={[glassStyles.formWrapper, theme.glass.cardWrapperStyle, style]}>
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[glassStyles.formBlur, glassStyles.blurContent]}>
          <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
          <View style={glassStyles.formContent}>{content}</View>
        </AdaptiveGlassView>
      </View>
    );
  }

  return <View ref={containerRef} style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
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
  glassCheckContainer: {
    position: 'absolute',
    right: spacing.md,
    top: 17,
    zIndex: 1,
  },
  glassCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: glassConstants.radius.icon,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
