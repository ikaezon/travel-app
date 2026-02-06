import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  spacing,
  fontFamilies,
  glassStyles,
  glassConstants,
} from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { AdaptiveGlassView } from '../../components/ui/AdaptiveGlassView';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface OptionCardProps {
  option: {
    id: string;
    title: string;
    subtitle: string;
    iconName: 'flight' | 'hotel';
    iconColor: string;
    iconBgColor: string;
    route: 'FlightEntry' | 'LodgingEntry';
  };
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}

function OptionCard({ option, onPress, theme }: OptionCardProps) {
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[styles.optionCardWrapper, !theme.isDark && { borderColor: theme.glassColors.border }, theme.isDark && { borderWidth: 0 }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.optionCardBlur, glassStyles.blurContent]}>
          <View style={[styles.glassOverlay, { backgroundColor: theme.isDark ? 'rgba(40, 40, 45, 0.35)' : theme.glassColors.overlayStrong }]} pointerEvents="none" />
          <View style={styles.optionCardContent}>
            <View style={[styles.optionIconContainer, { backgroundColor: option.iconBgColor }]}>
              <MaterialIcons name={option.iconName} size={28} color={option.iconColor} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: theme.colors.text.primary }]}>{option.title}</Text>
              <Text style={[styles.optionSubtitle, { color: theme.colors.text.secondary }]}>{option.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </View>
        </AdaptiveGlassView>
      </Pressable>
    </Animated.View>
  );
}

export default function ManualEntryOptionsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + 8;
  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const MANUAL_ENTRY_OPTIONS = [
    {
      id: 'flight',
      title: 'Flight',
      subtitle: 'Add flight details',
      iconName: 'flight' as const,
      iconColor: theme.colors.reservation.flight.icon,
      iconBgColor: theme.colors.reservation.flight.bg,
      route: 'FlightEntry' as const,
    },
    {
      id: 'lodging',
      title: 'Lodging',
      subtitle: 'Add hotel or stay details',
      iconName: 'hotel' as const,
      iconColor: theme.colors.reservation.hotel.icon,
      iconBgColor: theme.colors.reservation.hotel.bg,
      route: 'LodgingEntry' as const,
    },
  ];

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <View style={[styles.content, { paddingTop: topOffset + 72 }]}>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>What would you like to add?</Text>
          <View style={styles.optionsList}>
            {MANUAL_ENTRY_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                onPress={() => navigation.navigate(option.route)}
                theme={theme}
              />
            ))}
          </View>
        </View>

        <GlassNavHeader
          title="Manual Entry"
          onBackPress={handleBackPress}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    marginBottom: spacing.xl,
  },
  optionsList: {
    gap: 12,
  },
  optionCardWrapper: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
  },
  optionCardBlur: {
    padding: 12,
    position: 'relative',
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: glassConstants.radius.icon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    lineHeight: 20,
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    lineHeight: 20,
  },
});
