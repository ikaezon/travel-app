import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../theme';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  onPress?: () => void;
  delay?: number;
}

export function QuickActionCard({
  title,
  subtitle,
  iconName,
  iconColor,
  onPress,
  delay = 0,
}: QuickActionCardProps) {
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
        <BlurView intensity={24} tint="light" style={styles.card}>
          <View style={styles.cardOverlay} pointerEvents="none" />
          <View style={styles.content}>
            <BlurView intensity={50} tint="light" style={styles.iconContainer}>
              <MaterialIcons name={iconName} size={28} color={iconColor} />
            </BlurView>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>
          <BlurView intensity={50} tint="light" style={styles.chevronContainer}>
            <MaterialIcons name="chevron-right" size={20} color={colors.text.tertiary.light} />
          </BlurView>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 28, // rounded-[1.75rem]
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)', // border-white/60
    // Diffuse shadow behind card (Material Design style)
    boxShadow: '0 2px 5px 2px rgba(0, 0, 0, 0.02)',
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // bg-white/40-45
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20, // gap-5
    flex: 1,
  },
  iconContainer: {
    padding: 14, // p-3.5
    borderRadius: 16, // rounded-2xl
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.glass.borderStrong,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16, // text-base
    fontWeight: '800', // font-extrabold
    color: colors.text.primary.light,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12, // text-xs
    fontWeight: '600', // font-semibold
    color: colors.text.secondary.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5, // tracking-wider
    marginTop: 2, // mt-0.5
  },
  chevronContainer: {
    width: 32, // size-8
    height: 32,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.glass.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
