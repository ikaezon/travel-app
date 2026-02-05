import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { QUICK_ACTION_ICON_MAP, ChevronRight, type QuickActionIconKey } from '../../constants/quickActionIcons';
import { colors, borderRadius, fontFamilies, glassStyles } from '../../theme';

export type { QuickActionIconKey };

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
  const IconComponent = QUICK_ACTION_ICON_MAP[iconKey];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, delay]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable
        style={({ pressed }) => [styles.cardWrapper, pressed && styles.cardPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        <BlurView intensity={24} tint="light" style={[styles.card, glassStyles.blurContent]}>
          <View style={styles.cardOverlay} pointerEvents="none" />
          <View style={styles.content}>
            <BlurView intensity={50} tint="light" style={[styles.iconContainer, glassStyles.blurContentIcon]}>
              {IconComponent && <IconComponent size={26} color={iconColor} strokeWidth={2} />}
            </BlurView>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>
          <BlurView intensity={50} tint="light" style={[styles.chevronContainer, glassStyles.blurContentIcon]}>
            <ChevronRight size={20} color={colors.text.tertiary.light} strokeWidth={2} />
          </BlurView>
        </BlurView>
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
  cardPressed: {
    transform: [{ scale: 0.97 }],
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
    color: colors.text.primary.light,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.text.secondary.light,
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
