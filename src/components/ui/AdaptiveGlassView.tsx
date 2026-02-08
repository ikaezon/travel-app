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
  /** When true, uses GlassView only in light mode (e.g. nav bars). Default: false */
  useGlassInLightMode?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  absoluteFill?: boolean;
}

export function AdaptiveGlassView({
  intensity = 24,
  darkIntensity,
  glassEffectStyle = 'regular',
  useGlassInLightMode = false,
  style,
  children,
  absoluteFill = false,
}: AdaptiveGlassViewProps) {
  const { isDark, blurTint } = useTheme();

  const resolvedStyle = absoluteFill
    ? [{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 }, style]
    : style;

  /** Dark mode: GlassView everywhere. Light mode: GlassView only on nav bars (useGlassInLightMode) */
  const useGlassView = liquidGlassReady && (isDark || useGlassInLightMode);
  const themeKey = isDark ? 'dark' : 'light';

  if (useGlassView) {
    return (
      <GlassView key={themeKey} style={resolvedStyle} glassEffectStyle={glassEffectStyle}>
        {children}
      </GlassView>
    );
  }

  const resolvedIntensity = isDark ? (darkIntensity ?? intensity) : intensity;

  return (
    <BlurView key={themeKey} intensity={resolvedIntensity} tint={blurTint} style={resolvedStyle}>
      {children}
    </BlurView>
  );
}
