import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { TripIconType } from '../../types';

interface TripCardProps {
  destination: string;
  dateRange: string;
  durationLabel: string;
  imageUrl: string;
  iconName: TripIconType;
  onPress?: () => void;
  delay?: number;
}

export const TripCard = React.memo(function TripCard({
  destination,
  dateRange,
  durationLabel,
  imageUrl,
  iconName,
  onPress,
  delay = 0,
}: TripCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, delay]);

  const getIconName = (): keyof typeof MaterialIcons.glyphMap => {
    switch (iconName) {
      case 'airplane-ticket':
        return 'flight';
      case 'hotel':
        return 'hotel';
      case 'train':
        return 'train';
      default:
        return 'flight';
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
      >
      <View style={styles.imageContainer}>
        <ImageBackground source={{ uri: imageUrl }} style={styles.image} resizeMode="cover">
          <View style={styles.durationBadge}>
            <MaterialIcons name="flight-takeoff" size={14} color={colors.text.primary.light} />
            <Text style={styles.durationText}>{durationLabel}</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.textContainer}>
            <Text style={styles.destination} numberOfLines={1}>
              {destination}
            </Text>
            <Text style={styles.dateRange} numberOfLines={1}>
              {dateRange}
            </Text>
          </View>
          <View style={styles.iconBadge}>
            <MaterialIcons name={getIconName()} size={20} color={colors.primary} />
          </View>
        </View>
      </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    margin: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  destination: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  dateRange: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary.light,
  },
  iconBadge: {
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
});
