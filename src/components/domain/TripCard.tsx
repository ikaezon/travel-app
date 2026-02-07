import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, fontFamilies, glassStyles, glassConstants } from '../../theme';
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
  
  // Scale animation for consistent "pop in" entrance effect
  const entranceScaleAnim = useRef(new Animated.Value(0.95)).current;
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
    Animated.spring(entranceScaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 12,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay]);

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

  // Combine entrance animation with press animation
  const animatedStyle = { transform: [{ scale: Animated.multiply(entranceScaleAnim, scaleAnim) }] };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[
          styles.cardWrapper,
          theme.glass.cardWrapperStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${destination}. ${dateRange}. ${durationLabel}`}
      >
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.card, glassStyles.blurContent]}>
          <View style={[styles.cardOverlay, { backgroundColor: theme.glass.overlay }]} pointerEvents="none" />
          
          {/* Inner border overlay - creates anti-aliased edge effect for larger cards */}
          {theme.isDark && (
            <View style={styles.innerBorderOverlay} pointerEvents="none">
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.08)']}
                locations={[0, 0.1, 0.9, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}
          
          <View style={styles.innerContainer}>
            <View style={styles.imageFrame}>
              <ImageBackground
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
              >
                <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.durationBadge, glassStyles.blurContentPill, theme.glass.pillContainerStyle]}>
                  <View style={[styles.durationOverlay, { backgroundColor: theme.glass.badgeOverlay }]} pointerEvents="none" />
                  <MaterialIcons name="flight-takeoff" size={14} color={theme.colors.text.primary} />
                  <Text style={[styles.durationText, { color: theme.colors.text.primary }]}>{durationLabel}</Text>
                </AdaptiveGlassView>
              </ImageBackground>
            </View>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={[styles.destination, { color: theme.colors.text.primary }]} numberOfLines={1}>
                  {destination}
                </Text>
                <Text style={[styles.dateRange, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                  {dateRange}
                </Text>
              </View>
              <View style={[styles.iconBadge, glassStyles.blurContentIcon, theme.glass.iconContainerStyle]}>
                <MaterialIcons name={getIconName()} size={24} color={theme.isDark ? theme.colors.text.secondary : accentColor} />
              </View>
            </View>
          </View>
        </AdaptiveGlassView>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    ...glassStyles.cardWrapper,
    width: 300,
  },
  card: {
    position: 'relative',
  },
  cardOverlay: {
    ...glassStyles.cardOverlay,
  },
  innerBorderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: glassConstants.radiusInner.card,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
    overflow: 'hidden',
  },
  innerContainer: {
    padding: 8,
    gap: 12,
  },
  imageFrame: {
    height: 140,
    width: '100%',
    borderRadius: 20, // 28 - 8 padding
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
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
});
