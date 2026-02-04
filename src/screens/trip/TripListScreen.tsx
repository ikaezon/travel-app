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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useTrips } from '../../hooks';
import { Trip } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/** Stable style refs per status to avoid inline objects in list items. */
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
        <ImageBackground
          source={{ uri: trip.imageUrl }}
          style={styles.tripImage}
          imageStyle={styles.tripImageStyle}
        >
          <View style={styles.tripOverlay}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, statusDotStyle]} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
            <View style={styles.durationBadge}>
              <MaterialIcons name="schedule" size={14} color={colors.text.primary.light} />
              <Text style={styles.durationText}>{trip.durationLabel}</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.tripContent}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripDestination} numberOfLines={1}>
              {trip.destination}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.text.secondary.light} />
          </View>
          <Text style={styles.tripDateRange}>{trip.dateRange}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

type TripSection = { title: string; count: number; data: Trip[] };

export default function TripListScreen() {
  const navigation = useNavigation<NavigationProp>();
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
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{section.count}</Text>
        </View>
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle}>My Trips</Text>
          <View style={styles.addButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
        </Pressable>
        <Text style={styles.headerTitle}>My Trips</Text>
        <Pressable style={styles.addButton} onPress={handleAddTripPress}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <SectionList<Trip, TripSection>
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  tripItemWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  tripCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tripCardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  tripImage: {
    height: 140,
    justifyContent: 'space-between',
  },
  tripImageStyle: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  tripOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  tripContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripDestination: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  tripDateRange: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary.light,
  },
});
