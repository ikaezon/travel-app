import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, borderRadius, fontFamilies, glassStyles } from '../../theme';
import { TripIconType } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from '../ui/AdaptiveGlassView';

interface TripCardProps {
  destination: string;
  dateRange: string;
  durationLabel: string;
  imageUrl: string;
  iconName: TripIconType;
  onPress?: () => void;
  delay?: number;
}

// Spring configs matching the nav bar bubble feel
const PRESS_SPRING = { tension: 280, friction: 14, useNativeDriver: true };
const RELEASE_SPRING = { tension: 200, friction: 18, useNativeDriver: true };
const PRESS_SCALE = 1.03;

export const TripCard = React.memo(function TripCard({
  destination,
  dateRange,
  durationLabel,
  imageUrl,
  iconName,
  onPress,
  delay = 0,
}: TripCardProps) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const getAccentColor = (iconName: TripIconType): string => {
    switch (iconName) {
      case 'hotel':
        return theme.colors.accent.indigo;
      case 'train':
        return theme.colors.status.success;
      default:
        return theme.colors.accent.blue;
    }
  };
  
  const accentColor = getAccentColor(iconName);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, delay]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { ...PRESS_SPRING, toValue: PRESS_SCALE }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { ...RELEASE_SPRING, toValue: 1 }).start();
  }, [scaleAnim]);

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
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.cardWrapper,
          !theme.isDark && { borderColor: theme.glassColors.border },
          theme.isDark && { borderWidth: 0 },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" absoluteFill style={glassStyles.blurContentXLarge} />
        <View style={[styles.cardOverlay, { backgroundColor: theme.isDark ? 'rgba(40, 40, 45, 0.35)' : theme.glassColors.overlay }]} pointerEvents="none" />

        <View style={styles.innerContainer}>
          <View style={styles.imageFrame}>
            <ImageBackground 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
            >
              <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.durationBadge, glassStyles.blurContentPill, !theme.isDark && { borderWidth: 1, borderColor: theme.glassColors.borderStrong }]}>
                <View style={[styles.durationOverlay, { backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.35)' : theme.colors.glass.iconInset }]} pointerEvents="none" />
                <MaterialIcons name="flight-takeoff" size={14} color={theme.colors.text.primary} />
                <Text style={[styles.durationText, { color: theme.colors.text.primary }]}>{durationLabel}</Text>
              </AdaptiveGlassView>
            </ImageBackground>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.textContainer}>
                <Text style={[styles.destination, { color: theme.colors.text.primary }]} numberOfLines={1}>
                  {destination}
                </Text>
                <Text style={[styles.dateRange, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                  {dateRange}
                </Text>
              </View>
              <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.iconBadge, glassStyles.blurContentIcon, !theme.isDark && { borderColor: theme.glassColors.borderStrong }, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : theme.colors.glass.iconInset }]}>
                <MaterialIcons name={getIconName()} size={24} color={accentColor} />
              </AdaptiveGlassView>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    ...glassStyles.cardWrapperLarge,
    width: 300,
    position: 'relative',
  },
  cardOverlay: {
    ...glassStyles.cardOverlay,
  },
  innerContainer: {
    padding: 8,
    gap: 12,
  },
  imageFrame: {
    height: 140,
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  durationBadge: {
    ...glassStyles.pillContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: borderRadius.full,
    margin: 12,
  },
  durationOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  durationText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
  },
  content: {
    paddingHorizontal: 16,
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
    fontFamily: fontFamilies.semibold,
  },
  dateRange: {
    fontSize: 14, 
    fontFamily: fontFamilies.semibold,
    marginTop: 4, 
  },
  iconBadge: {
    ...glassStyles.iconContainer,
    padding: 10,
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
    fontFamily: fontFamilies.semibold,
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
});
