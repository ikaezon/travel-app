import React from 'react';
import { Text, StyleSheet, Pressable, View, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamilies, glassStyles, glassColors, glassConstants, glassShadows, borderRadius } from '../../theme';

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
  const isDisabled = disabled || loading;

  if (variant === 'boardingPass') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.boardingPassWrapper,
          pressed && styles.buttonPressed,
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <BlurView intensity={24} tint="light" style={[StyleSheet.absoluteFill, glassStyles.blurContent]} />
        <View style={styles.boardingPassOverlay} pointerEvents="none" />
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.reservation.flight.icon} />
          ) : (
            <>
              {iconName && (
                <MaterialIcons name={iconName} size={24} color={colors.reservation.flight.icon} />
              )}
              <Text style={styles.boardingPassLabel}>{label}</Text>
            </>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
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
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: colors.primary,
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
    borderColor: glassColors.borderShimmerBlue,
    boxShadow: glassShadows.icon,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardingPassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: glassColors.overlayBlue,
  },
  boardingPassLabel: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.reservation.flight.icon,
    letterSpacing: 0.3,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
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
    color: colors.white,
    letterSpacing: 0.3,
  },
});
