import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, borderRadius, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { ReservationType } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView, isNativeGlassActive } from '../ui/AdaptiveGlassView';

function getTimelineIconConfig(type: ReservationType, theme: ReturnType<typeof useTheme>) {
  const TIMELINE_ICON_CONFIG: Record<ReservationType, { name: keyof typeof MaterialIcons.glyphMap; iconColor: string }> = {
    flight: {
      name: 'flight-takeoff',
      iconColor: theme.colors.reservation.flight.icon,
    },
    hotel: {
      name: 'hotel',
      iconColor: theme.colors.reservation.hotel.icon,
    },
    train: {
      name: 'train',
      iconColor: theme.colors.reservation.train.icon,
    },
    car: {
      name: 'directions-car',
      iconColor: theme.colors.reservation.car.icon,
    },
  };

  const DEFAULT_ICON_CONFIG = {
    name: 'place' as const,
    iconColor: theme.colors.text.secondary,
  };

  return TIMELINE_ICON_CONFIG[type] ?? DEFAULT_ICON_CONFIG;
}

type TimelineActionType = 'boardingPass' | 'directions' | 'ticket' | 'default';

function getActionType(actionLabel: string): TimelineActionType {
  if (actionLabel === 'Boarding Pass') return 'boardingPass';
  if (actionLabel === 'Get Directions') return 'directions';
  if (actionLabel === 'View Ticket') return 'ticket';
  return 'default';
}

interface TimelineCardProps {
  type: ReservationType;
  time: string;
  title: string;
  subtitle: string;
  metadata?: string;
  actionLabel: string;
  actionIcon: keyof typeof MaterialIcons.glyphMap;
  thumbnailUrl?: string;
  onPress?: () => void;
  onActionPress?: () => void;
  delay?: number;
}

// Spring configs matching the nav bar bubble feel
const PRESS_SPRING = { tension: 280, friction: 14, useNativeDriver: true };
const RELEASE_SPRING = { tension: 200, friction: 18, useNativeDriver: true };
const PRESS_SCALE = 1.03;

export const TimelineCard = React.memo(function TimelineCard({
  type,
  time,
  title,
  subtitle,
  metadata,
  actionLabel,
  actionIcon,
  thumbnailUrl,
  onPress,
  onActionPress,
  delay = 0,
}: TimelineCardProps) {
  const theme = useTheme();
  
  // Native GlassView doesn't initialize properly when container starts at opacity 0.
  // Use scale animation instead of opacity when native glass is active.
  const useGlassAnimation = isNativeGlassActive(theme.isDark);
  
  const fadeAnim = useRef(new Animated.Value(useGlassAnimation ? 1 : 0)).current;
  const entranceScaleAnim = useRef(new Animated.Value(useGlassAnimation ? 0.95 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (useGlassAnimation) {
      // Scale up animation for native glass - keeps opacity at 1
      Animated.spring(entranceScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 12,
        delay,
        useNativeDriver: true,
      }).start();
    } else {
      // Standard fade animation for BlurView
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [delay, useGlassAnimation]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { ...PRESS_SPRING, toValue: PRESS_SCALE }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { ...RELEASE_SPRING, toValue: 1 }).start();
  }, [scaleAnim]);

  const iconConfig = getTimelineIconConfig(type, theme);
  const actionType = getActionType(actionLabel);

  // Combine entrance animation with wrapper style
  const wrapperAnimStyle = useGlassAnimation
    ? { opacity: 1, transform: [{ scale: entranceScaleAnim }] }
    : { opacity: fadeAnim };

  return (
    <Animated.View style={[styles.wrapper, wrapperAnimStyle]}>
      <View style={styles.container}>
        <View style={styles.timelineColumn}>
          <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.iconContainer, glassStyles.blurContentIcon, !theme.isDark && { borderColor: theme.glass.border }, theme.isDark && { borderWidth: 1, borderColor: theme.glass.borderStrong }, { backgroundColor: theme.isDark ? theme.glass.iconBg : undefined }]}>
            {!theme.isDark && <View style={[styles.glassOverlay, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]} pointerEvents="none" />}
            <MaterialIcons
              name={iconConfig.name}
              size={24}
              color={iconConfig.iconColor}
            />
          </AdaptiveGlassView>
        </View>

        <Animated.View style={[styles.cardAnimWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          style={[styles.card, theme.glass.cardWrapperStyle]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" absoluteFill style={glassStyles.blurContent} />
          <View style={[styles.cardOverlay, { backgroundColor: theme.glass.overlay }]} pointerEvents="none" />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
               <View style={{ flex: 1 }}>
                 <Text style={[styles.categoryLabel, { color: iconConfig.iconColor }]}>
                   {type.toUpperCase()}
                 </Text>
                 <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
               </View>
               <Text style={[styles.timeLabel, { color: theme.colors.text.secondary }]}>{time}</Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.textContainer}>
                 <Text style={[styles.subtitle, { color: theme.colors.text.primary }]}>{subtitle}</Text>
                 {metadata && <Text style={[styles.metadata, { color: theme.colors.text.tertiary }]}>{metadata}</Text>}
              </View>
              
              {thumbnailUrl && (
                <View style={styles.thumbnailContainer}>
                  <ImageBackground
                    source={{ uri: thumbnailUrl }}
                    style={styles.thumbnail}
                    imageStyle={styles.thumbnailImage}
                  />
                </View>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                actionType === 'boardingPass' && [styles.actionButtonBlue, { borderColor: theme.glass.borderShimmerBlue }],
                actionType === 'directions' && [styles.actionButtonOrange, { borderColor: theme.glass.borderShimmerOrange }],
                actionType === 'default' && { borderColor: iconConfig.iconColor },
                pressed && styles.actionButtonPressed,
                !theme.isDark && { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' },
              ]}
              onPress={onActionPress}
            >
              <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" absoluteFill style={glassStyles.blurContentIcon} />
              <View
                style={[
                  StyleSheet.absoluteFill,
                  actionType === 'boardingPass' && { backgroundColor: theme.glass.overlayBlue },
                  actionType === 'directions' && { backgroundColor: theme.glass.overlayOrange },
                  actionType === 'default' && { backgroundColor: theme.glass.overlay },
                ]}
                pointerEvents="none"
              />
              <View style={styles.actionButtonContent}>
                <Text
                  style={[
                    styles.actionLabel,
                    {
                      color:
                        actionType === 'boardingPass'
                          ? theme.colors.reservation.flight.icon
                          : actionType === 'directions'
                            ? theme.colors.reservation.hotel.icon
                            : iconConfig.iconColor,
                    },
                  ]}
                >
                  {actionLabel}
                </Text>
                <MaterialIcons
                  name={actionIcon}
                  size={18}
                  color={
                    actionType === 'boardingPass'
                      ? theme.colors.reservation.flight.icon
                      : actionType === 'directions'
                        ? theme.colors.reservation.hotel.icon
                        : iconConfig.iconColor
                  }
                />
              </View>
            </Pressable>
          </View>
        </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: 0,
  },
  container: {
    flexDirection: 'row',
    gap: 16,
    position: 'relative',
    alignItems: 'flex-start',
  },
  timelineColumn: {
    alignItems: 'center',
    width: 48,
    gap: 8,
    marginTop: 4,
  },
  iconContainer: {
    ...glassStyles.iconContainer,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  cardAnimWrapper: {
    flex: 1,
  },
  card: {
    ...glassStyles.cardWrapper,
  },
  cardOverlay: {
    ...glassStyles.cardOverlay,
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamilies.semibold,
    lineHeight: 22,
    letterSpacing: -0.5,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
  },
  metadata: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: glassConstants.radius.icon,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
  },
  actionButtonBlue: {
    borderWidth: glassConstants.borderWidth.cardThin,
  },
  actionButtonOrange: {
    borderWidth: glassConstants.borderWidth.cardThin,
  },
  actionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: fontFamilies.semibold,
    letterSpacing: -0.2,
  },
  thumbnailContainer: {
    width: 64,
    height: 64,
    borderRadius: glassConstants.radius.icon,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  thumbnail: {
    flex: 1,
  },
  thumbnailImage: {
    borderRadius: glassConstants.radius.icon,
  },
});
