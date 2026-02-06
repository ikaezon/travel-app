import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import {
  MapPinPlus,
  ImagePlus,
  PenSquare,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react-native';
import { borderRadius, fontFamilies, glassStyles } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from '../ui/AdaptiveGlassView';

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

// Spring configs matching the nav bar bubble feel
const PRESS_SPRING = { tension: 280, friction: 14, useNativeDriver: true };
const RELEASE_SPRING = { tension: 200, friction: 18, useNativeDriver: true };
const PRESS_SCALE = 1.03;

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
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

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.cardWrapper,
          !theme.isDark && { borderColor: theme.glassColors.border },
          theme.isDark && { borderWidth: 0 },
          !theme.isDark && { boxShadow: theme.glassShadows.card },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.card, glassStyles.blurContent]}>
          <View style={[styles.cardOverlay, { backgroundColor: theme.isDark ? 'rgba(40, 40, 45, 0.35)' : theme.glassColors.overlay }]} pointerEvents="none" />
          <View style={styles.content}>
            <View style={[styles.iconContainer, glassStyles.blurContentIcon, theme.isDark && { borderWidth: 1, borderColor: theme.glassColors.borderStrong }, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : theme.colors.glass.iconInset }]}>
              {IconComponent && <IconComponent size={26} color={theme.isDark ? theme.colors.text.secondary : iconColor} strokeWidth={2} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.text.tertiary }]}>{subtitle}</Text>
            </View>
          </View>
          <View style={[styles.chevronContainer, glassStyles.blurContentIcon, theme.isDark && { borderWidth: 1, borderColor: theme.glassColors.borderStrong }, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : theme.colors.glass.iconInset }]}>
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
