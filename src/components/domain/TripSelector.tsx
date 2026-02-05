import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontFamilies, glassStyles, glassColors } from '../../theme';
import type { Trip } from '../../types';

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
          {trips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            return (
              <Pressable
                key={trip.id}
                style={({ pressed }) => [
                  styles.tripRow,
                  variant === 'glass' && styles.tripRowGlass,
                  isSelected && styles.tripRowSelected,
                  pressed && styles.tripRowPressed,
                ]}
                onPress={() => onSelectTrip(trip.id)}
                accessibilityLabel={`Select trip ${trip.destination}, ${trip.dateRange}`}
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.tripRowContent}>
                  <Text style={[styles.tripDestination, isSelected && styles.tripTextSelected]} numberOfLines={1}>
                    {trip.destination}
                  </Text>
                  <Text style={[styles.tripDateRange, isSelected && styles.tripTextSelected]} numberOfLines={1}>
                    {trip.dateRange}
                  </Text>
                </View>
                {isSelected && (
                  <MaterialIcons name="check-circle" size={22} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
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
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  tripRowGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: glassColors.border,
  },
  tripRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tripRowPressed: {
    opacity: 0.9,
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
