import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { ReservationType } from '../../types';
import { TIMELINE_COLUMN_WIDTH, TIMELINE_ICON_RADIUS, TIMELINE_ICON_SIZE, TIMELINE_LINE_LEFT } from '../../constants';

interface TimelineCardProps {
  type: ReservationType;
  time: string;
  title: string;
  subtitle: string;
  metadata?: string;
  actionLabel: string;
  actionIcon: keyof typeof MaterialIcons.glyphMap;
  thumbnailUrl?: string;
  showConnector?: boolean;
  connectorToNextDay?: boolean;
  connectorFromPreviousDay?: boolean;
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
  showConnector = false,
  connectorToNextDay = false,
  connectorFromPreviousDay = false,
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
      {connectorFromPreviousDay && (
        <View style={styles.connectorFromPreviousDayRow}>
          <View style={styles.connectorColumn}>
            <View style={styles.connectorFromPreviousDaySegment} />
          </View>
          <View style={styles.connectorSpacer} />
        </View>
      )}
      <View style={styles.container}>
      <View style={styles.timelineColumn}>
        {showConnector && <View style={styles.connectorLine} />}
        {connectorToNextDay && <View style={styles.connectorToNextDayLine} />}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconConfig.bgColor },
          ]}
        >
          <MaterialIcons
            name={iconConfig.name}
            size={20}
            color={iconConfig.iconColor}
          />
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              {metadata && <Text style={styles.metadata}>{metadata}</Text>}
            </View>

            <Pressable
              style={styles.actionButton}
              onPress={onActionPress}
            >
              <Text style={styles.actionLabel}>{actionLabel}</Text>
          <MaterialIcons name={actionIcon} size={16} color={colors.primary} />
            </Pressable>
          </View>

          {thumbnailUrl && (
            <ImageBackground
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              imageStyle={styles.thumbnailImage}
            />
          )}
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
  connectorFromPreviousDayRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 36,
    marginTop: -10,
    gap: spacing.md,
  },
  connectorColumn: {
    width: TIMELINE_COLUMN_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  connectorFromPreviousDaySegment: {
    width: 2,
    height: 36,
    backgroundColor: colors.border.light,
    borderRadius: 1,
  },
  connectorSpacer: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    position: 'relative',
  },
  timelineColumn: {
    alignItems: 'center',
    minWidth: TIMELINE_COLUMN_WIDTH,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  iconContainer: {
    width: TIMELINE_ICON_SIZE,
    height: TIMELINE_ICON_SIZE,
    borderRadius: TIMELINE_ICON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.background.light,
    zIndex: 2,
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary.light,
  },
  connectorLine: {
    position: 'absolute',
    top: 75,
    bottom: -12,
    left: TIMELINE_LINE_LEFT,
    width: 2,
    backgroundColor: colors.border.light,
    zIndex: 1,
  },
  connectorToNextDayLine: {
    position: 'absolute',
    top: 75,
    bottom: -10,
    left: TIMELINE_LINE_LEFT,
    width: 2,
    backgroundColor: colors.border.light,
    zIndex: 1,
  },
  card: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.light,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary.light,
    marginTop: spacing.xs,
  },
  metadata: {
    fontSize: 12,
    color: colors.text.tertiary.light,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 32,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  thumbnail: {
    width: 80,
    alignSelf: 'stretch',
  },
  thumbnailImage: {
    borderRadius: borderRadius.sm,
  },
});
