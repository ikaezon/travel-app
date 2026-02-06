import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontFamilies, glassStyles, glassColors } from '../../theme';
import type { Trip } from '../../types';

interface TripRowProps {
  trip: Trip;
  isSelected: boolean;
  onSelect: (tripId: string) => void;
  variant: 'default' | 'glass';
}

function TripRow({ trip, isSelected, onSelect, variant }: TripRowProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Initialize with correct value based on initial selection state
  const checkAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const wasSelected = useRef(isSelected);

  useEffect(() => {
    // Only animate if selection state changed (not on initial mount)
    if (isSelected && !wasSelected.current) {
      // Selection animation sequence
      // Note: useNativeDriver: false for all because we're animating colors on the same view
      Animated.parallel([
        // Scale bounce
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.96,
            duration: 80,
            useNativeDriver: false,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 300,
            useNativeDriver: false,
          }),
        ]),
        // Checkmark pop in
        Animated.spring(checkAnim, {
          toValue: 1,
          friction: 5,
          tension: 400,
          useNativeDriver: false,
        }),
        // Border color fade
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (!isSelected && wasSelected.current) {
      // Deselection animation
      Animated.parallel([
        Animated.timing(checkAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }

    wasSelected.current = isSelected;
  }, [isSelected, scaleAnim, checkAnim, borderAnim]);

  const handlePress = useCallback(() => {
    onSelect(trip.id);
  }, [onSelect, trip.id]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      variant === 'glass' ? glassColors.border : colors.border.light,
      colors.primary,
    ],
  });

  const backgroundColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      variant === 'glass' ? 'rgba(255, 255, 255, 0.5)' : colors.surface.light,
      colors.primaryLight,
    ],
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.tripRow,
          {
            transform: [{ scale: scaleAnim }],
            borderColor,
            backgroundColor,
          },
        ]}
        accessibilityLabel={`Select trip ${trip.destination}, ${trip.dateRange}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.tripRowContent}>
          <Text
            style={[styles.tripDestination, isSelected && styles.tripTextSelected]}
            numberOfLines={1}
          >
            {trip.destination}
          </Text>
          <Text
            style={[styles.tripDateRange, isSelected && styles.tripTextSelected]}
            numberOfLines={1}
          >
            {trip.dateRange}
          </Text>
        </View>
        <Animated.View
          style={{
            transform: [
              {
                scale: checkAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
            opacity: checkAnim,
          }}
        >
          <MaterialIcons name="check-circle" size={22} color={colors.primary} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export interface TripSelectorProps {
  trips: Trip[];
  selectedTripId: string | null;
  onSelectTrip: (tripId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
  /** Use liquid glass card styling */
  variant?: 'default' | 'glass';
}

export function TripSelector({
  trips,
  selectedTripId,
  onSelectTrip,
  isLoading = false,
  error = null,
  variant = 'default',
}: TripSelectorProps) {
  const content = (() => {
    if (isLoading) {
      return (
        <>
          <Text style={[styles.label, variant === 'glass' && styles.labelGlass]}>Add to trip</Text>
          <View style={[styles.loadingRow, variant === 'glass' && styles.loadingRowGlass]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading trips…</Text>
          </View>
        </>
      );
    }

    if (error) {
      return (
        <>
          <Text style={[styles.label, variant === 'glass' && styles.labelGlass]}>Add to trip</Text>
          <Text style={styles.errorText}>Could not load trips. Try again.</Text>
        </>
      );
    }

    if (trips.length === 0) {
      return (
        <>
          <Text style={[styles.label, variant === 'glass' && styles.labelGlass]}>Add to trip</Text>
          <Text style={styles.emptyText}>No trips yet. Create a trip first.</Text>
        </>
      );
    }

    return (
      <>
        <Text style={[styles.label, variant === 'glass' && styles.labelGlass]}>Add to trip</Text>
        {!selectedTripId && (
          <Text style={styles.hint}>Select a trip below to save this item.</Text>
        )}
        <View style={styles.tripList}>
          {trips.map((trip) => (
            <TripRow
              key={trip.id}
              trip={trip}
              isSelected={trip.id === selectedTripId}
              onSelect={onSelectTrip}
              variant={variant}
            />
          ))}
        </View>
      </>
    );
  })();

  if (variant === 'glass') {
    return (
      <View style={styles.glassWrapper}>
        <BlurView intensity={24} tint="light" style={[styles.glassBlur, glassStyles.blurContent]}>
          <View style={styles.glassOverlay} pointerEvents="none" />
          <View style={styles.glassContent}>{content}</View>
        </BlurView>
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  glassWrapper: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
    marginBottom: spacing.lg,
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
  label: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    marginBottom: spacing.sm,
  },
  labelGlass: {
    color: colors.text.primary.light,
  },
  loadingRowGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: glassColors.border,
  },
  hint: {
    fontSize: 13,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    marginBottom: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    paddingVertical: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    paddingVertical: spacing.sm,
  },
  tripList: {
    gap: spacing.xs,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  tripRowContent: {
    flex: 1,
    gap: spacing.xxs,
    marginRight: spacing.sm,
  },
  tripDestination: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  tripDateRange: {
    fontSize: 13,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
  },
  tripTextSelected: {
    color: colors.primaryDark,
  },
});
