import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontFamilies, glassStyles, glassColors, glassShadows, glassConstants } from '../../theme';
import { ReservationType } from '../../types';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, delay]);

  const getIconConfig = () => {
    switch (type) {
      case 'flight':
        return {
          name: 'flight-takeoff' as keyof typeof MaterialIcons.glyphMap,
          bgColor: colors.reservation.flight.bg,
          iconColor: colors.reservation.flight.icon,
        };
      case 'hotel':
        return {
          name: 'hotel' as keyof typeof MaterialIcons.glyphMap,
          bgColor: colors.reservation.hotel.bg,
          iconColor: colors.reservation.hotel.icon,
        };
      case 'train':
        return {
          name: 'train' as keyof typeof MaterialIcons.glyphMap,
          bgColor: colors.reservation.train.bg,
          iconColor: colors.reservation.train.icon,
        };
      case 'car':
        return {
          name: 'directions-car' as keyof typeof MaterialIcons.glyphMap,
          bgColor: colors.reservation.car.bg,
          iconColor: colors.reservation.car.icon,
        };
      default:
        return {
          name: 'place' as keyof typeof MaterialIcons.glyphMap,
          bgColor: colors.background.light,
          iconColor: colors.text.secondary.light,
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={styles.container}>
        <View style={styles.timelineColumn}>
          <BlurView intensity={24} tint="light" style={[styles.iconContainer, glassStyles.blurContentIcon]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <MaterialIcons
              name={iconConfig.name}
              size={24}
              color={iconConfig.iconColor}
            />
          </BlurView>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
          onPress={onPress}
        >
          <BlurView intensity={24} tint="light" style={[StyleSheet.absoluteFill, glassStyles.blurContent]} />
          <View style={styles.cardOverlay} pointerEvents="none" />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
               <View style={{ flex: 1 }}>
                 <Text style={[styles.categoryLabel, { color: iconConfig.iconColor }]}>
                   {type.toUpperCase()}
                 </Text>
                 <Text style={styles.title}>{title}</Text>
               </View>
               <Text style={styles.timeLabel}>{time}</Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.textContainer}>
                 <Text style={styles.subtitle}>{subtitle}</Text>
                 {metadata && <Text style={styles.metadata}>{metadata}</Text>}
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
                actionLabel === 'Boarding Pass' && styles.actionButtonBlue,
                actionLabel === 'Get Directions' && styles.actionButtonOrange,
                !['Boarding Pass', 'Get Directions'].includes(actionLabel) && { borderColor: iconConfig.iconColor },
                pressed && styles.actionButtonPressed,
              ]}
              onPress={onActionPress}
            >
              <BlurView intensity={24} tint="light" style={[StyleSheet.absoluteFill, glassStyles.blurContentIcon]} />
              <View
                style={[
                  StyleSheet.absoluteFill,
                  actionLabel === 'Boarding Pass' && { backgroundColor: glassColors.overlayBlue },
                  actionLabel === 'Get Directions' && { backgroundColor: glassColors.overlayOrange },
                  !['Boarding Pass', 'Get Directions'].includes(actionLabel) && styles.actionButtonDefaultOverlay,
                ]}
                pointerEvents="none"
              />
              <View style={styles.actionButtonContent}>
                <Text
                  style={[
                    styles.actionLabel,
                    {
                      color:
                        actionLabel === 'Boarding Pass'
                          ? colors.reservation.flight.icon
                          : actionLabel === 'Get Directions'
                            ? colors.reservation.hotel.icon
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
                    actionLabel === 'Boarding Pass'
                      ? colors.reservation.flight.icon
                      : actionLabel === 'Get Directions'
                        ? colors.reservation.hotel.icon
                        : iconConfig.iconColor
                  }
                />
              </View>
            </Pressable>
          </View>
        </Pressable>
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
    borderColor: glassColors.border,
    zIndex: 2,
    boxShadow: glassShadows.icon,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  card: {
    ...glassStyles.cardWrapper,
    flex: 1,
  },
  cardOverlay: {
    ...glassStyles.cardOverlay,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
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
    color: colors.text.primary.light,
    lineHeight: 22,
    letterSpacing: -0.5,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.text.secondary.light,
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
    color: colors.text.primary.light,
  },
  metadata: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.text.tertiary.light,
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
    boxShadow: glassShadows.icon,
  },
  actionButtonBlue: {
    borderWidth: glassConstants.borderWidth.cardThin,
    borderColor: glassColors.borderShimmerBlue,
  },
  actionButtonOrange: {
    borderWidth: glassConstants.borderWidth.cardThin,
    borderColor: glassColors.borderShimmerOrange,
  },
  actionButtonDefaultOverlay: {
    backgroundColor: glassColors.overlay,
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
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  thumbnail: {
    flex: 1,
  },
  thumbnailImage: {
    borderRadius: 16,
  },
});
