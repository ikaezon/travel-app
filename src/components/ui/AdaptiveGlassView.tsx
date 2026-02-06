import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Whether native liquid glass is available on this device.
 * Evaluated once at module load.
 */
const liquidGlassReady = isLiquidGlassAvailable();

interface AdaptiveGlassViewProps {
  /** Blur intensity used when falling back to BlurView (light mode or unsupported device) */
  intensity?: number;
  /** Dark-mode intensity override — only used when falling back to BlurView in dark mode */
  darkIntensity?: number;
  /** GlassView style: 'regular' | 'clear'. Only used when native glass is active. */
  glassEffectStyle?: 'regular' | 'clear';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  /** If true, the component fills its parent absolutely (useful for background layers) */
  absoluteFill?: boolean;
}

/**
 * Renders iOS 26 native liquid glass in dark mode when available,
 * and falls back to expo-blur BlurView otherwise.
 * Light mode always uses BlurView — no changes.
 */
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

  // Dark mode + native liquid glass available → use GlassView
  if (isDark && liquidGlassReady) {
    return (
      <GlassView style={resolvedStyle} glassEffectStyle={glassEffectStyle}>
        {children}
      </GlassView>
    );
  }

  // Everything else → BlurView (untouched light mode path, or dark fallback)
  const resolvedIntensity = isDark ? (darkIntensity ?? intensity) : intensity;

  return (
    <BlurView intensity={resolvedIntensity} tint={blurTint} style={resolvedStyle}>
      {children}
    </BlurView>
  );
}
