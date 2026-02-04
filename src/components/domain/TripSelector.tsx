import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import type { Trip } from '../../types';

export interface TripSelectorProps {
  /** List of trips from [Trips] table */
  trips: Trip[];
  /** Currently selected trip id, or null if none selected */
  selectedTripId: string | null;
  /** Called when user selects a trip */
  onSelectTrip: (tripId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function TripSelector({
  trips,
  selectedTripId,
  onSelectTrip,
  isLoading = false,
  error = null,
}: TripSelectorProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Add to trip</Text>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading trips…</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Add to trip</Text>
        <Text style={styles.errorText}>Could not load trips. Try again.</Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Add to trip</Text>
        <Text style={styles.emptyText}>No trips yet. Create a trip first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add to trip</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary.light,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: 13,
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
    color: colors.text.secondary.light,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary.light,
    paddingVertical: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
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
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  tripDateRange: {
    fontSize: 13,
    color: colors.text.secondary.light,
  },
  tripTextSelected: {
    color: colors.primaryDark,
  },
});
