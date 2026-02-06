import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { TimelineCard } from '../../components/domain/TimelineCard';
import { TripMapPreview } from '../../components/domain/TripMapPreview';
import { GlassDropdownMenu } from '../../components/ui/GlassDropdownMenu';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { MainStackParamList } from '../../navigation/types';
import { useTripTimeline, useDeleteTrip, usePressAnimation } from '../../hooks';
import { colors, spacing, borderRadius, fontFamilies, glassStyles, glassColors, glassShadows, glassConstants } from '../../theme';
import { sortTimelineItemsByDateAndTime } from '../../utils/dateFormat';

const TIMELINE_FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Flights', value: 'flight' },
  { label: 'Hotels', value: 'hotel' },
  { label: 'Trains', value: 'train' },
] as const;

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'TripOverview'>;
type TripOverviewRouteProp = RouteProp<MainStackParamList, 'TripOverview'>;

export default function TripOverviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TripOverviewRouteProp>();
  const insets = useSafeAreaInsets();
  const tripId = route.params?.tripId || '';
  const tripName = route.params?.tripName || 'Trip Overview';

  const { timeline, isLoading, error, refetch } = useTripTimeline(tripId);
  const { deleteTrip, isDeleting } = useDeleteTrip();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [addMenuVisible, setAddMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const filteredItems = useMemo(
    () =>
      selectedFilter === 'all'
        ? timeline
        : timeline.filter((item) => item.type === selectedFilter),
    [timeline, selectedFilter]
  );

  const groupedByDate = useMemo(() => {
    const sorted = sortTimelineItemsByDateAndTime(filteredItems);
    return sorted.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {} as Record<string, typeof timeline>);
  }, [filteredItems]);

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleReservationPress = useCallback(
    (itemId: string) => {
      navigation.navigate('ReservationDetail', { timelineItemId: itemId });
    },
    [navigation]
  );

  const handleDeleteTrip = useCallback(() => {
    Alert.alert(
      'Delete trip',
      'This will remove the trip and all its reservations. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip(tripId);
              navigation.goBack();
            } catch (e) {
              const message = e instanceof Error ? e.message : 'Failed to delete trip.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  }, [deleteTrip, tripId, navigation]);

  const handleMenuSelect = useCallback(
    (index: number) => {
      if (index === 0) handleDeleteTrip();
    },
    [handleDeleteTrip]
  );

  const handleOpenAddMenu = useCallback(() => setAddMenuVisible(true), []);
  const handleCloseAddMenu = useCallback(() => setAddMenuVisible(false), []);

  const handleAddFlight = useCallback(() => {
    setAddMenuVisible(false);
    navigation.navigate('FlightEntry', { tripId });
  }, [navigation, tripId]);
  const handleAddHotel = useCallback(() => {
    setAddMenuVisible(false);
    navigation.navigate('LodgingEntry', { tripId });
  }, [navigation, tripId]);
  const handleAddTrain = useCallback(() => {
    setAddMenuVisible(false);
    navigation.navigate('TrainEntry', { tripId });
  }, [navigation, tripId]);

  const fabAnim = usePressAnimation();

  const handleExpandMap = useCallback(() => {
    navigation.navigate('MapExpand', { tripId, tripName });
  }, [navigation, tripId, tripName]);

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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={32} color={colors.status.error} />
            <Text style={styles.errorTitle}>Unable to load trip timeline</Text>
            <Text style={styles.errorSubtitle}>Please try again in a moment.</Text>
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: topOffset + 72 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mapSection}>
            <TripMapPreview tripId={tripId} onExpandPress={handleExpandMap} />
          </View>

          <View style={styles.filterSection}>
            <BlurView intensity={24} tint="light" style={[styles.filterContainer, glassStyles.blurContent]}>
              <View style={styles.glassOverlay} pointerEvents="none" />
              <SegmentedControl
                options={TIMELINE_FILTER_OPTIONS}
                selectedValue={selectedFilter}
                onValueChange={setSelectedFilter}
              />
            </BlurView>
          </View>

          <View style={styles.timeline}>
            {Object.entries(groupedByDate).map(([date, items], dateIndex) => (
              <View key={date} style={styles.dateGroup}>
                <View style={styles.dateHeader}>
                  <View style={styles.dateLine} />
                  <Text style={styles.dateText}>{date}</Text>
                  <View style={styles.dateLine} />
                </View>

                {items.map((item, itemIndex) => {
                  const cardDelay = 120 + (dateIndex * items.length + itemIndex) * 50;

                  return (
                    <TimelineCard
                      key={item.id}
                      type={item.type}
                      time={item.time}
                      title={item.title}
                      subtitle={item.subtitle}
                      metadata={item.metadata}
                      actionLabel={item.actionLabel}
                      actionIcon={item.actionIcon as keyof typeof MaterialIcons.glyphMap}
                      thumbnailUrl={item.thumbnailUrl}
                      onPress={() => handleReservationPress(item.id)}
                      onActionPress={() => handleReservationPress(item.id)}
                      delay={cardDelay}
                    />
                  );
                })}
              </View>
            ))}

            {filteredItems.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="event-note" size={48} color={colors.text.tertiary.light} />
                <Text style={styles.emptyStateText}>No reservations found</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <GlassNavHeader
          title={tripName}
          label="Trip"
          onBackPress={handleBackPress}
          rightAction={{
            icon: 'more-horiz',
            onPress: () => setMenuVisible(true),
            accessibilityLabel: 'Trip options',
          }}
        />

        {menuVisible && (
          <>
            <Pressable
              style={styles.menuScrim}
              onPress={() => setMenuVisible(false)}
              accessibilityLabel="Close menu"
            />
            <GlassDropdownMenu
              visible={menuVisible}
              onClose={() => setMenuVisible(false)}
              actions={[{ label: 'Delete trip', icon: 'delete-outline', destructive: true }]}
              onSelect={() => handleDeleteTrip()}
              style={[styles.deleteMenuDropdown, { top: topOffset + 64 }]}
            />
          </>
        )}

        {addMenuVisible && (
          <Pressable style={styles.addMenuScrim} onPress={handleCloseAddMenu} accessibilityLabel="Close add menu" />
        )}

        <View style={[styles.fabContainer, { bottom: insets.bottom + 56 }]} pointerEvents="box-none">
          <GlassDropdownMenu
            visible={addMenuVisible}
            onClose={handleCloseAddMenu}
            actions={[
              { label: 'Add Flight', icon: 'flight' },
              { label: 'Add Hotel', icon: 'hotel' },
              { label: 'Add Train', icon: 'train' },
            ]}
            onSelect={(index) => {
              if (index === 0) handleAddFlight();
              if (index === 1) handleAddHotel();
              if (index === 2) handleAddTrain();
            }}
            style={styles.addMenuDropdown}
          />
          <Animated.View style={{ transform: [{ scale: fabAnim.scaleAnim }] }}>
          <Pressable
            style={styles.fabWrapper}
            onPress={() => (addMenuVisible ? handleCloseAddMenu() : handleOpenAddMenu())}
            onPressIn={fabAnim.onPressIn}
            onPressOut={fabAnim.onPressOut}
            accessibilityLabel={addMenuVisible ? 'Close add menu' : 'Add reservation'}
          >
            <BlurView intensity={24} tint="light" style={styles.fabBlur}>
              <View style={styles.fabGlassOverlay} pointerEvents="none" />
              <View style={styles.fabContent}>
                <MaterialIcons name="add" size={28} color={colors.primary} />
              </View>
            </BlurView>
          </Pressable>
          </Animated.View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary.light,
    textAlign: 'center',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  menuScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: 'transparent',
  },
  deleteMenuDropdown: {
    position: 'absolute',
    right: 24,
    zIndex: 70,
  },
  deleteMenuItemText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.status.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 16,
  },
  mapSection: {
    paddingHorizontal: 20,
  },
  filterSection: {
    paddingHorizontal: 20,
  },
  filterContainer: {
    ...glassStyles.cardWrapper,
    padding: 4,
    boxShadow: glassShadows.card,
  },
  timeline: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dateGroup: {
    gap: 16,
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.4)',
  },
  dateText: {
    fontSize: 11,
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.text.secondary.light,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: fontFamilies.medium,
    color: colors.text.tertiary.light,
  },
  addMenuScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  addMenuDropdown: {
    position: 'absolute',
    bottom: 70,
    right: 0,
  },
  addMenuItemText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  fabWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.card,
    borderColor: glassColors.border,
    boxShadow: glassShadows.elevated,
  },
  fabBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    overflow: 'hidden',
  },
  fabGlassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  fabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
