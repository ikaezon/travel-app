import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { GlassDropdownMenu } from '../../components/ui';
import { TimelineCard } from '../../components/domain/TimelineCard';
import { FadeInView } from '../../components/ui/FadeInView';
import { MainStackParamList } from '../../navigation/types';
import { useTripTimeline, useDeleteTrip, useMenuAnimation } from '../../hooks';
import { colors, spacing, borderRadius } from '../../theme';
import { TIMELINE_FILTER_OPTIONS } from '../../constants';
import { mockImages } from '../../data/mocks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'TripOverview'>;
type TripOverviewRouteProp = RouteProp<MainStackParamList, 'TripOverview'>;

export default function TripOverviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TripOverviewRouteProp>();
  const tripId = route.params?.tripId || '';
  const tripName = route.params?.tripName || 'Trip Overview';

  const { timeline, isLoading, error, refetch } = useTripTimeline(tripId);
  const { deleteTrip, isDeleting } = useDeleteTrip();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const addMenuAnimation = useMenuAnimation(addMenuVisible);

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

  const mapImageUrl = mockImages.mapPlaceholder;

  const groupedByDate = useMemo(
    () =>
      filteredItems.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
      }, {} as Record<string, typeof timeline>),
    [filteredItems]
  );

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleReservationPress = useCallback(
    (itemId: string) => {
      navigation.navigate('ReservationDetail', { reservationId: itemId });
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{tripName}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{tripName}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={32} color={colors.status.error} />
          <Text style={styles.errorTitle}>Unable to load trip timeline</Text>
          <Text style={styles.errorSubtitle}>Please try again in a moment.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{tripName}</Text>
        <View style={styles.headerActionWrap}>
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerActionPressed]}
            onPress={() => setMenuVisible(true)}
            accessibilityLabel="Trip options"
          >
            <MaterialIcons name="more-vert" size={24} color={colors.text.primary.light} />
          </Pressable>
          <GlassDropdownMenu
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            actions={[{ label: 'Delete trip', icon: 'delete-outline', destructive: true }]}
            onSelect={handleMenuSelect}
            style={styles.menuDropdown}
          />
        </View>
        </View>

      {menuVisible && (
        <Pressable
          style={styles.menuScrim}
          onPress={() => setMenuVisible(false)}
          accessibilityLabel="Close menu"
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView duration={150} delay={0}>
          <View style={styles.mapSection}>
            <Pressable style={styles.mapContainer}>
              <ImageBackground
                source={{ uri: mapImageUrl }}
                style={styles.mapImage}
                imageStyle={styles.mapImageStyle}
              >
                <View style={[styles.pin, styles.pinLeft]}>
                  <MaterialIcons name="location-on" size={30} color={colors.primary} />
                </View>
                <View style={[styles.pin, styles.pinRight]}>
                  <MaterialIcons name="location-on" size={30} color={colors.status.error} />
                </View>

                <View style={styles.mapBadge}>
                  <MaterialIcons name="map" size={14} color={colors.primary} />
                  <Text style={styles.mapBadgeText}>View Map</Text>
                </View>
              </ImageBackground>
            </Pressable>
          </View>
        </FadeInView>

        <FadeInView duration={150} delay={60}>
          <View style={styles.filterSection}>
            <SegmentedControl
              options={TIMELINE_FILTER_OPTIONS}
              selectedValue={selectedFilter}
              onValueChange={setSelectedFilter}
            />
          </View>
        </FadeInView>

        <View style={styles.timeline}>
          {Object.entries(groupedByDate).map(([date, items], dateIndex) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <View style={styles.dateLine} />
                <Text style={styles.dateText}>{date}</Text>
                <View style={styles.dateLine} />
              </View>

              {items.map((item, itemIndex) => {
                const isLastInDate = itemIndex === items.length - 1;
                const hasNextDateGroup = dateIndex < Object.keys(groupedByDate).length - 1;
                const showConnector = !isLastInDate;
                const connectorToNextDay = isLastInDate && hasNextDateGroup;
                const connectorFromPreviousDay = dateIndex > 0 && itemIndex === 0;
                
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
                    showConnector={showConnector}
                    connectorToNextDay={connectorToNextDay}
                    connectorFromPreviousDay={connectorFromPreviousDay}
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

      {addMenuVisible && (
        <Pressable style={styles.addMenuScrim} onPress={handleCloseAddMenu} accessibilityLabel="Close add menu" />
      )}

      <View style={styles.fabContainer} pointerEvents="box-none">
        {addMenuVisible && (
          <Animated.View
            style={[
              styles.addMenuDropdown,
              { opacity: addMenuAnimation.opacity, transform: [{ scale: addMenuAnimation.scale }] },
            ]}
          >
            <Pressable
              style={({ pressed }) => [styles.addMenuItem, styles.addMenuItemBorder, pressed && styles.addMenuItemPressed]}
              onPress={handleAddFlight}
            >
              <MaterialIcons name="flight" size={20} color={colors.primary} />
              <Text style={styles.addMenuItemText}>Add Flight</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.addMenuItem, styles.addMenuItemBorder, pressed && styles.addMenuItemPressed]}
              onPress={handleAddHotel}
            >
              <MaterialIcons name="hotel" size={20} color={colors.primary} />
              <Text style={styles.addMenuItemText}>Add Hotel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.addMenuItem, pressed && styles.addMenuItemPressed]}
              onPress={handleAddTrain}
            >
              <MaterialIcons name="train" size={20} color={colors.primary} />
              <Text style={styles.addMenuItemText}>Add Train</Text>
            </Pressable>
          </Animated.View>
        )}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => (addMenuVisible ? handleCloseAddMenu() : handleOpenAddMenu())}
          accessibilityLabel={addMenuVisible ? 'Close add menu' : 'Add reservation'}
        >
          <MaterialIcons name="add" size={28} color={colors.white} />
        </Pressable>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary.light,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.light,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionWrap: {
    position: 'relative',
    minWidth: 40,
    alignItems: 'flex-end',
  },
  headerActionPressed: {
    backgroundColor: colors.background.light,
  },
  menuScrim: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  menuDropdown: {
    top: 44,
    right: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.3,
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mapSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mapContainer: {
    width: '100%',
    height: 192,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImageStyle: {
    borderRadius: 12,
  },
  pin: {
    position: 'absolute',
  },
  pinLeft: {
    top: '33%',
    left: '25%',
  },
  pinRight: {
    bottom: '33%',
    right: '33%',
  },
  mapBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface.light,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  timeline: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  dateGroup: {
    gap: 16,
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    fontWeight: '500',
    color: colors.text.tertiary.light,
  },
  addMenuScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  addMenuDropdown: {
    position: 'absolute',
    bottom: 56,
    right: 0,
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.md,
    minWidth: 180,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  addMenuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  addMenuItemPressed: {
    backgroundColor: colors.background.light,
  },
  addMenuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.9,
  },
});
