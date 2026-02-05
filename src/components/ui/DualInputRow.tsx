import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, fontFamilies, glassStyles, glassColors, borderRadius } from '../../theme';

interface DualInputRowProps {
  leftLabel: string;
  leftValue: string;
  leftPlaceholder?: string;
  leftIconName?: keyof typeof MaterialIcons.glyphMap;
  onLeftChange: (text: string) => void;
  rightLabel: string;
  rightValue: string;
  rightPlaceholder?: string;
  rightIconName?: keyof typeof MaterialIcons.glyphMap;
  onRightChange: (text: string) => void;
  /** Icon to show between the two inputs */
  separatorIcon?: keyof typeof MaterialIcons.glyphMap;
}

export function DualInputRow({
  leftLabel,
  leftValue,
  leftPlaceholder,
  leftIconName,
  onLeftChange,
  rightLabel,
  rightValue,
  rightPlaceholder,
  rightIconName,
  onRightChange,
  separatorIcon = 'arrow-forward',
}: DualInputRowProps) {
  return (
    <View style={styles.glassWrapper}>
      <BlurView intensity={24} tint="light" style={[styles.glassBlur, glassStyles.blurContent]}>
        <View style={styles.glassOverlay} pointerEvents="none" />
        <View style={styles.glassContent}>
          {/* Labels row */}
          <View style={styles.labelsRow}>
            <Text style={styles.label}>{leftLabel}</Text>
            <View style={styles.labelSpacer} />
            <Text style={styles.label}>{rightLabel}</Text>
          </View>

          {/* Inputs row */}
          <View style={styles.inputsRow}>
            {/* Left input */}
            <View style={styles.inputWrapper}>
              {leftIconName && (
                <MaterialIcons
                  name={leftIconName}
                  size={18}
                  color={colors.text.secondary.light}
                  style={styles.inputIcon}
                />
              )}
              <TextInput
                style={[styles.input, leftIconName && styles.inputWithIcon]}
                value={leftValue}
                onChangeText={onLeftChange}
                placeholder={leftPlaceholder}
                placeholderTextColor={colors.text.tertiary.light}
              />
            </View>

            {/* Separator icon */}
            <View style={styles.separatorContainer}>
              <MaterialIcons
                name={separatorIcon}
                size={20}
                color={colors.text.secondary.light}
              />
            </View>

            {/* Right input */}
            <View style={styles.inputWrapper}>
              {rightIconName && (
                <MaterialIcons
                  name={rightIconName}
                  size={18}
                  color={colors.text.secondary.light}
                  style={styles.inputIcon}
                />
              )}
              <TextInput
                style={[styles.input, rightIconName && styles.inputWithIcon]}
                value={rightValue}
                onChangeText={onRightChange}
                placeholder={rightPlaceholder}
                placeholderTextColor={colors.text.tertiary.light}
              />
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  labelsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.primary.light,
  },
  labelSpacer: {
    width: 32, // Space for the separator icon
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: glassColors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    color: colors.text.primary.light,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    top: 15,
    zIndex: 1,
  },
  separatorContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
