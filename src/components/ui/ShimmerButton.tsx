import React from 'react';
import { Text, StyleSheet, Pressable, View, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamilies, glassStyles, glassConstants, borderRadius } from '../../theme';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';

interface ShimmerButtonProps {
  label: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Boarding pass style: liquid glass with blue tint */
  variant?: 'default' | 'boardingPass';
}

export function ShimmerButton({
  label,
  iconName,
  onPress,
  disabled = false,
  loading = false,
  variant = 'default',
}: ShimmerButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();

  if (variant === 'boardingPass') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.boardingPassWrapper,
          {
            borderColor: theme.glass.borderShimmerBlue,
            boxShadow: theme.glass.cardBoxShadow,
          },
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
      >
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" absoluteFill style={glassStyles.blurContent} />
        <View style={[styles.boardingPassOverlay, { backgroundColor: theme.glass.overlayBlue }]} pointerEvents="none" />
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.reservation.flight.icon} />
          ) : (
            <>
              {iconName && (
                <MaterialIcons name={iconName} size={24} color={theme.colors.reservation.flight.icon} />
              )}
              <Text style={[styles.boardingPassLabel, { color: theme.colors.reservation.flight.icon }]}>{label}</Text>
            </>
          )}
        </View>
      </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
        },
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.25)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.shimmer}
      />

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            {iconName && (
              <MaterialIcons name={iconName} size={24} color="white" />
            )}
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </View>
    </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: glassConstants.radius.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  boardingPassWrapper: {
    height: 56,
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.cardThin,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardingPassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  boardingPassLabel: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: 'white',
    letterSpacing: 0.3,
  },
});
