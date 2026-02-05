import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
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

// Calculate preparation percentage based on days until trip
// const getPreparationPercent = (durationLabel: string): number => {
//   const days = parseInt(durationLabel.replace(/\D/g, ''), 10) || 30;
//   if (days <= 7) return 95;
//   if (days <= 14) return 80;
//   if (days <= 30) return 60;
//   return 45;
// };

const getAccentColor = (iconName: TripIconType): string => {
  switch (iconName) {
    case 'hotel':
      return colors.accent.indigo;
    case 'train':
      return colors.status.success;
    default:
      return colors.accent.blue;
  }
};

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
  const accentColor = getAccentColor(iconName);

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
        style={({ pressed }) => [styles.cardWrapper, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        {/* Liquid Glass Background */}
        <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.cardOverlay} pointerEvents="none" />

        {/* Content Container */}
        <View style={styles.innerContainer}>
          {/* Image Section */}
          <View style={styles.imageFrame}>
            <ImageBackground 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
            >
              <BlurView intensity={40} tint="light" style={styles.durationBadge}>
                <MaterialIcons name="flight-takeoff" size={14} color={colors.text.primary.light} />
                <Text style={styles.durationText}>{durationLabel}</Text>
              </BlurView>
            </ImageBackground>
          </View>

          {/* Content Section */}
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
              <BlurView intensity={40} tint="light" style={styles.iconBadge}>
                <MaterialIcons name={getIconName()} size={24} color={accentColor} />
              </BlurView>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    width: 300,
    borderRadius: 40, // rounded-[2.5rem]
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)', // border-white/60
    // Diffuse shadow behind card (Material Design style)
    boxShadow: '0 2px 5px 2px rgba(0, 0, 0, 0.02)',
    position: 'relative',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // bg-white/40-45
  },
  innerContainer: {
    padding: 8, // p-2
    gap: 12,
  },
  imageFrame: {
    height: 140, // h-44 -> Reduced to fit on screen
    width: '100%',
    borderRadius: 28, // rounded-[1.8rem]
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
    gap: 4,
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: borderRadius.full,
    margin: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text.primary.light,
  },
  content: {
    paddingHorizontal: 16, // p-6 sides -> reduced to match compact look
    paddingBottom: 16,
    gap: 8, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  destination: {
    fontSize: 18, 
    fontWeight: '800', 
    color: colors.text.primary.light,
  },
  dateRange: {
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.text.secondary.light,
    marginTop: 4, 
  },
  iconBadge: {
    padding: 10, 
    borderRadius: 16, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressSection: {
    gap: 8, 
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12, 
    fontWeight: '700', 
    color: colors.text.secondary.light,
  },
  progressTrack: {
    height: 12, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    padding: 2, 
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
});
