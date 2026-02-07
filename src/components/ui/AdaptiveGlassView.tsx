import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '../../contexts/ThemeContext';

const liquidGlassReady = isLiquidGlassAvailable();

interface AdaptiveGlassViewProps {
  intensity?: number;
  darkIntensity?: number;
  glassEffectStyle?: 'regular' | 'clear';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  absoluteFill?: boolean;
}

export function AdaptiveGlassView({
  intensity = 24,
  darkIntensity,
  glassEffectStyle = 'regular',
  style,
  children,
  absoluteFill = false,
}: AdaptiveGlassViewProps) {
  const { isDark, blurTint } = useTheme();

  const resolvedStyle = absoluteFill
    ? [{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 }, style]
    : style;

  if (isDark && liquidGlassReady) {
    return (
      <GlassView style={resolvedStyle} glassEffectStyle={glassEffectStyle}>
        {children}
      </GlassView>
    );
  }

  const resolvedIntensity = isDark ? (darkIntensity ?? intensity) : intensity;

  return (
    <BlurView intensity={resolvedIntensity} tint={blurTint} style={resolvedStyle}>
      {children}
    </BlurView>
  );
}
