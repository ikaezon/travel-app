import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import {
  MapPinPlus,
  ImagePlus,
  PenSquare,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react-native';
import { borderRadius, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from '../ui/AdaptiveGlassView';
import { usePressAnimation } from '../../hooks/usePressAnimation';

const QUICK_ACTION_ICON_MAP = {
  'map-pin-plus': MapPinPlus,
  'image-plus': ImagePlus,
  'pen-square': PenSquare,
} as const satisfies Record<string, LucideIcon>;

export type QuickActionIconKey = keyof typeof QUICK_ACTION_ICON_MAP;

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  iconKey: QuickActionIconKey;
  iconColor: string;
  iconBgColor: string;
  onPress?: () => void;
  delay?: number;
}

export function QuickActionCard({
  title,
  subtitle,
  iconKey,
  iconColor,
  onPress,
  delay = 0,
}: QuickActionCardProps) {
  const theme = useTheme();
  const IconComponent = QUICK_ACTION_ICON_MAP[iconKey];
  const { animatedScale, onPressIn, onPressOut } = usePressAnimation(1.03, delay);

  return (
    <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
      <Pressable
        style={[
          styles.cardWrapper,
          theme.glass.cardWrapperStyle,
        ]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.card, glassStyles.blurContent]}>
          <View style={[styles.cardOverlay, { backgroundColor: theme.glass.overlay }]} pointerEvents="none" />
          <View style={styles.content}>
            <View style={[styles.iconContainer, glassStyles.blurContentIcon, theme.glass.iconContainerStyle]}>
              {IconComponent && <IconComponent size={26} color={theme.isDark ? theme.colors.text.secondary : iconColor} strokeWidth={2} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.text.tertiary }]}>{subtitle}</Text>
            </View>
          </View>
          <View style={[styles.chevronContainer, glassStyles.blurContentIcon, theme.glass.iconContainerStyle]}>
            <ChevronRight size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
          </View>
        </AdaptiveGlassView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    ...glassStyles.cardWrapper,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    position: 'relative',
  },
  cardOverlay: {
    ...glassStyles.cardOverlay,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  iconContainer: {
    ...glassStyles.iconContainer,
    padding: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  chevronContainer: {
    ...glassStyles.iconContainer,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
