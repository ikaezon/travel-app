import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '../../theme';

interface GlassViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  showHighlight?: boolean;
}

export function GlassView({
  children,
  style,
  intensity = 25,
  tint = 'light',
  borderRadius: radius = borderRadius.lg,
  borderWidth = 1,
  borderColor = colors.glass.border,
  backgroundColor = colors.glass.background,
  showHighlight = true,
}: GlassViewProps) {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        styles.container,
        {
          borderRadius: radius,
          borderWidth,
          borderColor,
          backgroundColor,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      {showHighlight && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.highlight}
        />
      )}
      <View style={styles.content}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  content: {
    position: 'relative',
    zIndex: 10,
  },
});
