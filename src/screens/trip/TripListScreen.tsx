import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { usePressAnimation } from '../../hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, borderRadius, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useTrips } from '../../hooks';
import { Trip } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from '../../components/ui/AdaptiveGlassView';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// TRIP_STATUS_DOT_STYLE moved to component to use theme

const TRIP_STATUS_LABEL: Record<Trip['status'], string> = {
  ongoing: 'Ongoing',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

interface TripItemProps {
  trip: Trip;
  index: number;
  onPress: (tripId: string, tripName: string) => void;
}

const TripItem = React.memo(function TripItem({ trip, index, onPress }: TripItemProps) {
  const theme = useTheme();
  
  // Scale animation for consistent "pop in" entrance effect
  const entranceScaleAnim = useRef(new Animated.Value(0.95)).current;
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();

  useEffect(() => {
    Animated.spring(entranceScaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 12,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const tripName = trip.destination;
  const statusLabel = TRIP_STATUS_LABEL[trip.status] ?? trip.status;
  
  const TRIP_STATUS_DOT_STYLE: Record<Trip['status'], { backgroundColor: string }> = {
    ongoing: { backgroundColor: theme.colors.status.success },
    upcoming: { backgroundColor: theme.colors.primary },
    completed: { backgroundColor: theme.colors.text.tertiary },
  };
  const statusDotStyle = TRIP_STATUS_DOT_STYLE[trip.status] ?? { backgroundColor: theme.colors.text.secondary };

  // Combine entrance animation with press animation
  const animatedStyle = { transform: [{ scale: Animated.multiply(entranceScaleAnim, scaleAnim) }] };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[
          styles.tripCard,
          theme.glass.cardWrapperStyle,
        ]}
        onPress={() => onPress(trip.id, tripName)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" absoluteFill style={glassStyles.blurContentXLarge} />
        <View style={[styles.cardOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />

        <View style={styles.innerContainer}>
          <View style={styles.imageFrame}>
            <ImageBackground
              source={{ uri: trip.imageUrl }}
              style={styles.tripImage}
              resizeMode="cover"
            >
              <View style={styles.tripBadgeContainer}>
                <AdaptiveGlassView intensity={40} darkIntensity={10} glassEffectStyle="clear" style={[styles.statusBadge, glassStyles.blurContentPill, { borderColor: theme.glass.borderStrong, backgroundColor: theme.glass.overlay }]}>
                  <View style={[styles.statusDot, statusDotStyle]} />
                  <Text style={[styles.statusText, { color: theme.colors.text.primary }]}>{statusLabel}</Text>
                </AdaptiveGlassView>
                
                <AdaptiveGlassView intensity={40} darkIntensity={10} glassEffectStyle="clear" style={[styles.durationBadge, glassStyles.blurContentPill, { borderColor: theme.glass.borderStrong, backgroundColor: theme.glass.overlay }]}>
                  <MaterialIcons name="schedule" size={14} color={theme.colors.text.primary} />
                  <Text style={[styles.durationText, { color: theme.colors.text.primary }]}>{trip.durationLabel}</Text>
                </AdaptiveGlassView>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.tripContent}>
            <View style={styles.tripHeader}>
              <View style={styles.textContainer}>
                <Text style={[styles.tripDestination, { color: theme.colors.text.primary }]} numberOfLines={1}>
                  {trip.destination}
                </Text>
                <Text style={[styles.tripDateRange, { color: theme.colors.text.secondary }]}>{trip.dateRange}</Text>
              </View>
              <AdaptiveGlassView intensity={40} darkIntensity={10} glassEffectStyle="clear" style={[styles.iconBadge, glassStyles.blurContentIcon, { borderColor: theme.glass.borderStrong, backgroundColor: theme.glass.overlay }]}>
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.tertiary} />
              </AdaptiveGlassView>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

type TripSection = { title: string; count: number; data: Trip[] };

export default function TripListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { trips, isLoading } = useTrips();

  const sections = useMemo<TripSection[]>(() => {
    const upcoming = trips.filter((t) => t.status !== 'completed');
    const past = trips.filter((t) => t.status === 'completed');
    const out: TripSection[] = [];
    if (upcoming.length > 0) {
      out.push({ title: 'Upcoming & Ongoing', count: upcoming.length, data: upcoming });
    }
    if (past.length > 0) {
      out.push({ title: 'Past Trips', count: past.length, data: past });
    }
    return out;
  }, [trips]);

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);
  const handleTripPress = useCallback(
    (tripId: string, tripName: string) => {
      navigation.navigate('TripOverview', { tripId, tripName });
    },
    [navigation]
  );
  const handleAddTripPress = useCallback(
    () => navigation.navigate('ScreenshotUpload'),
    [navigation]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: TripSection }) => (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{section.title}</Text>
        <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.countBadge, glassStyles.blurContentPill, { borderColor: theme.glass.border }]}>
          <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
          <Text style={[styles.countText, { color: theme.colors.primary }]}>{section.count}</Text>
        </AdaptiveGlassView>
      </View>
    ),
    [theme]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Trip; index: number }) => (
      <View style={styles.tripItemWrapper}>
        <TripItem trip={item} index={index} onPress={handleTripPress} />
      </View>
    ),
    [handleTripPress]
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <GlassNavHeader title="My Trips" onBackPress={handleBackPress} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  const topOffset = insets.top + 8;

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <SectionList<Trip, TripSection>
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingTop: topOffset + 72 }]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />

        <GlassNavHeader
          title="My Trips"
          onBackPress={handleBackPress}
          rightAction={{ icon: 'add', onPress: handleAddTripPress, accessibilityLabel: 'Add trip' }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  listContent: {
    paddingBottom: 100,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fontFamilies.semibold,
    letterSpacing: -0.3,
  },
  countBadge: {
    ...glassStyles.pillContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  countText: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
  },
  tripItemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  tripCard: {
    ...glassStyles.cardWrapperLarge,
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
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
  },
  tripImage: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  tripBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  statusBadge: {
    ...glassStyles.pillContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
  },
  durationBadge: {
    ...glassStyles.pillContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  durationText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
  },
  tripContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  tripDestination: {
    fontSize: 18,
    fontFamily: fontFamilies.semibold,
  },
  tripDateRange: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    marginTop: 4,
  },
  iconBadge: {
    ...glassStyles.iconContainer,
    padding: 10,
  },
});
