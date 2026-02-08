import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { glassStyles, glassConstants, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';

const ANIM_DURATION = 800;

interface FormFieldSkeletonProps {
  bars?: number;
}

export function FormFieldSkeleton({ bars = 2 }: FormFieldSkeletonProps) {
  const theme = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.75,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacityAnim]);

  return (
    <View style={[glassStyles.formWrapper, theme.glass.cardWrapperStyle]}>
      <AdaptiveGlassView
        intensity={24}
        darkIntensity={10}
        glassEffectStyle="clear"
        style={[glassStyles.formBlur, glassStyles.blurContent]}
      >
        <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
        <View style={styles.content}>
          {Array.from({ length: bars }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                i === 0 ? styles.labelBar : styles.inputBar,
                { backgroundColor: theme.colors.text.tertiary, opacity: opacityAnim },
              ]}
            />
          ))}
        </View>
      </AdaptiveGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  bar: {
    borderRadius: borderRadius.md,
  },
  labelBar: {
    height: 14,
    width: '40%',
  },
  inputBar: {
    height: 56,
    width: '100%',
  },
});
