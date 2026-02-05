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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, fontFamilies, glassStyles, glassColors, glassConstants } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useTrips } from '../../hooks';
import { Trip } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const TRIP_STATUS_DOT_STYLE: Record<Trip['status'], { backgroundColor: string }> = {
  ongoing: { backgroundColor: colors.status.success },
  upcoming: { backgroundColor: colors.primary },
  completed: { backgroundColor: colors.text.tertiary.light },
};

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  const tripName = trip.destination;
  const statusLabel = TRIP_STATUS_LABEL[trip.status] ?? trip.status;
  const statusDotStyle = TRIP_STATUS_DOT_STYLE[trip.status] ?? { backgroundColor: colors.text.secondary.light };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable
        style={({ pressed }) => [styles.tripCard, pressed && styles.tripCardPressed]}
        onPress={() => onPress(trip.id, tripName)}
      >
        <BlurView intensity={glassConstants.blur.card} tint="light" style={[StyleSheet.absoluteFill, glassStyles.blurContentXLarge]} />
        <View style={styles.cardOverlay} pointerEvents="none" />

        <View style={styles.innerContainer}>
          <View style={styles.imageFrame}>
            <ImageBackground
              source={{ uri: trip.imageUrl }}
              style={styles.tripImage}
              resizeMode="cover"
            >
              <View style={styles.tripBadgeContainer}>
                <BlurView intensity={40} tint="light" style={[styles.statusBadge, glassStyles.blurContentPill]}>
                  <View style={[styles.statusDot, statusDotStyle]} />
                  <Text style={styles.statusText}>{statusLabel}</Text>
                </BlurView>
                
                <BlurView intensity={40} tint="light" style={[styles.durationBadge, glassStyles.blurContentPill]}>
                  <MaterialIcons name="schedule" size={14} color={colors.text.primary.light} />
                  <Text style={styles.durationText}>{trip.durationLabel}</Text>
                </BlurView>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.tripContent}>
            <View style={styles.tripHeader}>
              <View style={styles.textContainer}>
                <Text style={styles.tripDestination} numberOfLines={1}>
                  {trip.destination}
                </Text>
                <Text style={styles.tripDateRange}>{trip.dateRange}</Text>
              </View>
              <BlurView intensity={40} tint="light" style={[styles.iconBadge, glassStyles.blurContentIcon]}>
                <MaterialIcons name="chevron-right" size={24} color={colors.text.tertiary.light} />
              </BlurView>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

type TripSection = { title: string; count: number; data: Trip[] };

export default function TripListScreen() {
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
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <BlurView intensity={24} tint="light" style={[styles.countBadge, glassStyles.blurContentPill]}>
          <View style={styles.glassOverlay} pointerEvents="none" />
          <Text style={styles.countText}>{section.count}</Text>
        </BlurView>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Trip; index: number }) => (
      <View style={styles.tripItemWrapper}>
        <TripItem trip={item} index={index} onPress={handleTripPress} />
      </View>
    ),
    [handleTripPress]
  );

  const topOffset = insets.top + 8;

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <View style={[styles.headerContainer, { top: topOffset }]}>
            <BlurView intensity={24} tint="light" style={[styles.headerBlur, glassStyles.blurContentLarge]}>
              <View style={styles.glassOverlay} pointerEvents="none" />
              <View style={styles.headerContent}>
                <Pressable style={styles.backButton} onPress={handleBackPress}>
                  <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
                </Pressable>
                <Text style={styles.headerTitle}>My Trips</Text>
                <View style={styles.addButton} />
              </View>
            </BlurView>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
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

        <View style={[styles.headerContainer, { top: topOffset }]}>
          <BlurView intensity={24} tint="light" style={[styles.headerBlur, glassStyles.blurContentLarge]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.headerContent}>
              <Pressable style={styles.backButton} onPress={handleBackPress}>
                <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
              </Pressable>
              <Text style={styles.headerTitle}>My Trips</Text>
              <Pressable style={styles.addButton} onPress={handleAddTripPress}>
                <MaterialIcons name="add" size={22} color={colors.primary} />
              </Pressable>
            </View>
          </BlurView>
        </View>
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
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  headerBlur: {
    ...glassStyles.navBarWrapper,
    width: '90%',
    maxWidth: 340,
    position: 'relative',
    height: 56,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  countBadge: {
    ...glassStyles.pillContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: glassColors.border,
  },
  countText: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
  tripItemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  tripCard: {
    ...glassStyles.cardWrapperLarge,
    position: 'relative',
  },
  tripCardPressed: {
    transform: [{ scale: 0.98 }],
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
    borderRadius: 28,
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
    borderColor: glassColors.borderStrong,
    backgroundColor: glassColors.overlay,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  durationBadge: {
    ...glassStyles.pillContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderColor: glassColors.borderStrong,
    backgroundColor: glassColors.overlay,
  },
  durationText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
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
    color: colors.text.primary.light,
  },
  tripDateRange: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    color: colors.text.secondary.light,
    marginTop: 4,
  },
  iconBadge: {
    ...glassStyles.iconContainer,
    padding: 10,
    borderColor: glassColors.borderStrong,
    backgroundColor: glassColors.overlay,
  },
});
