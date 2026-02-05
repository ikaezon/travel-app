import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Menu, MoreHorizontal } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TripCard } from '../../components/domain/TripCard';
import { pickImageFromLibrary } from '../../native';
import { QuickActionCard } from '../../components/domain/QuickActionCard';
import { LoadingView, ErrorView } from '../../components/ui';
import { colors, spacing, borderRadius, fontFamilies, glassStyles, glassColors, glassShadows, glassConstants } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { QUICK_ACTION_ROUTES } from '../../constants';
import { useCurrentUser, useUpcomingTrips, useQuickActions } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function TripDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { user, isLoading: userLoading, error: userError, refetch: refetchUser } = useCurrentUser();
  const { trips, isLoading: tripsLoading, error: tripsError, refetch: refetchTrips } = useUpcomingTrips();
  const { quickActions, isLoading: actionsLoading, error: actionsError, refetch: refetchActions } = useQuickActions();

  const refetchAll = useCallback(() => {
    refetchUser();
    refetchTrips();
    refetchActions();
  }, [refetchUser, refetchTrips, refetchActions]);

  useFocusEffect(
    useCallback(() => {
      refetchAll();
    }, [refetchAll])
  );

  const isLoading = userLoading || tripsLoading || actionsLoading;
  const hasError = Boolean(userError || tripsError || actionsError);

  const handleTripPress = useCallback(
    (tripId: string, tripName: string) => {
      navigation.navigate('TripOverview', { tripId, tripName });
    },
    [navigation]
  );

  const handleSeeAllPress = useCallback(() => navigation.navigate('TripList'), [navigation]);

  const handleRetry = useCallback(() => refetchAll(), [refetchAll]);

  const handleQuickActionPress = useCallback(
    async (route: string) => {
      if (route === 'ScreenshotUpload') {
        const result = await pickImageFromLibrary();
        if (result && 'permissionDenied' in result) {
          Alert.alert(
            'Photo access',
            'Allow access to your photos to import tickets from screenshots.',
            [{ text: 'OK' }]
          );
          return;
        }
        if (result && 'uri' in result) {
          navigation.navigate('ReviewDetails', { imageUri: result.uri });
        }
        return;
      }
      const routeKey = route as keyof MainStackParamList;
      if (QUICK_ACTION_ROUTES.includes(routeKey)) {
        navigation.navigate(routeKey);
      }
    },
    [navigation]
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <LoadingView />
        </View>
      </LinearGradient>
    );
  }

  if (hasError) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <ErrorView
            title="Unable to load your dashboard"
            subtitle="Please try again in a moment."
            onRetry={handleRetry}
          />
        </View>
      </LinearGradient>
    );
  }

  const topOffset = insets.top + 8;

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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Trips</Text>
              <Pressable onPress={handleSeeAllPress}>
                <BlurView intensity={24} tint="light" style={[styles.seeAllButtonContainer, glassStyles.blurContentPill]}>
                  <View style={styles.glassOverlay} pointerEvents="none" />
                  <Text style={styles.seeAllButton}>See All</Text>
                </BlurView>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tripsCarousel}
              snapToInterval={320}
              decelerationRate="fast"
            >
              {trips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  destination={trip.destination}
                  dateRange={trip.dateRange}
                  durationLabel={trip.durationLabel}
                  imageUrl={trip.imageUrl}
                  iconName={trip.iconName}
                  onPress={() => handleTripPress(trip.id, trip.destination)}
                  delay={index * 60}
                />
              ))}
            </ScrollView>
          </View>

          <View style={[styles.section, styles.quickActionsSection]}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.id}
                  title={action.title}
                  subtitle={action.subtitle}
                  iconKey={action.iconKey as import('../../constants').QuickActionIconKey}
                  iconColor={action.iconColor}
                  iconBgColor={action.iconBgColor}
                  onPress={() => handleQuickActionPress(action.route)}
                  delay={trips.length * 60 + index * 50}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.topNavContainer, { top: topOffset }]}>
          <BlurView intensity={24} tint="light" style={[styles.topNavBlur, glassStyles.blurContentLarge]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.topNavContent}>
              <Pressable style={({ pressed }) => pressed && styles.navButtonPressed}>
                <View style={styles.navButton}>
                  <Menu size={22} color={colors.text.primary.light} strokeWidth={2} />
                </View>
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={styles.headerLabel}>Dashboard</Text>
                <Text style={styles.headerTitle}>My Trips</Text>
              </View>

              <Pressable style={({ pressed }) => pressed && styles.navButtonPressed}>
                <View style={styles.navButton}>
                  <MoreHorizontal size={22} color={colors.text.primary.light} strokeWidth={2} />
                </View>
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
  topNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  topNavBlur: {
    ...glassStyles.navBarWrapper,
    width: '90%',
    maxWidth: 340,
    position: 'relative',
    height: 56,
    justifyContent: 'center',
  },
  topNavContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonPressed: {
    opacity: 0.6,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 9,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 1,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 100,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  seeAllButtonContainer: {
    ...glassStyles.pillContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: glassColors.border,
  },
  seeAllButton: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
  tripsCarousel: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 20,
  },
  quickActionsSection: {
    paddingHorizontal: 24,
  },
  actionsContainer: {
    gap: 12,
  },
});
