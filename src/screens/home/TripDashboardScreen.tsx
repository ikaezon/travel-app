import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AdaptiveGlassView } from '../../components/ui/AdaptiveGlassView';
import { Menu, MoreHorizontal } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TripCard } from '../../components/domain/TripCard';
import { pickImageFromLibrary } from '../../native/imagePicker';
import { QuickActionCard, type QuickActionIconKey } from '../../components/domain/QuickActionCard';
import { LoadingView } from '../../components/ui/LoadingView';
import { ErrorView } from '../../components/ui/ErrorView';
import { spacing, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useCurrentUser, useUpcomingTrips, useQuickActions, usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

const QUICK_ACTION_ROUTES: readonly string[] = ['ManualEntryOptions', 'ScreenshotUpload', 'CreateTrip'];

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function TripDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
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
  const seeAllAnim = usePressAnimation();
  const menuAnim = usePressAnimation();
  const moreAnim = usePressAnimation();

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
          navigation.navigate('ReviewDetails', {
            imageUri: result.uri,
            base64: result.base64,
          });
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
        colors={theme.gradient}
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
        colors={theme.gradient}
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
      colors={theme.gradient}
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
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Upcoming Trips</Text>
              <Animated.View style={{ transform: [{ scale: seeAllAnim.scaleAnim }] }}>
              <Pressable onPress={handleSeeAllPress} onPressIn={seeAllAnim.onPressIn} onPressOut={seeAllAnim.onPressOut}>
                <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.seeAllButtonContainer, glassStyles.blurContentPill, { borderColor: theme.glass.border }]}>
                  <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
                  <Text style={[styles.seeAllButton, { color: theme.colors.primary }]}>See All</Text>
                </AdaptiveGlassView>
              </Pressable>
              </Animated.View>
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
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.id}
                  title={action.title}
                  subtitle={action.subtitle}
                  iconKey={action.iconKey as QuickActionIconKey}
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
          <View style={styles.topNavBarWrapper}>
            <AdaptiveGlassView
              intensity={24}
              useGlassInLightMode
              style={[styles.topNavBlur, glassStyles.blurContentLarge, theme.glass.navWrapperStyle]}
            >
              {!theme.isDark && <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlay }]} pointerEvents="none" />}
            </AdaptiveGlassView>
            <View style={styles.topNavContent}>
              <Animated.View style={{ transform: [{ scale: menuAnim.scaleAnim }] }}>
              <Pressable onPressIn={menuAnim.onPressIn} onPressOut={menuAnim.onPressOut}>
                <View style={styles.navButton}>
                  <Menu size={22} color={theme.colors.text.primary} strokeWidth={2} />
                </View>
              </Pressable>
              </Animated.View>

              <View style={styles.headerCenter}>
                <Text style={[styles.headerLabel, { color: theme.colors.primary }]}>Dashboard</Text>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>My Trips</Text>
              </View>

              <Animated.View style={{ transform: [{ scale: moreAnim.scaleAnim }] }}>
              <Pressable onPressIn={moreAnim.onPressIn} onPressOut={moreAnim.onPressOut}>
                <View style={styles.navButton}>
                  <MoreHorizontal size={22} color={theme.colors.text.primary} strokeWidth={2} />
                </View>
              </Pressable>
              </Animated.View>
            </View>
          </View>
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
  topNavBarWrapper: {
    width: '90%',
    maxWidth: 340,
    height: 56,
    position: 'relative',
    overflow: 'visible',
  },
  topNavBlur: {
    ...StyleSheet.absoluteFillObject,
    ...glassStyles.navBarWrapper,
    zIndex: 0,
  },
  topNavContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: glassConstants.radius.icon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 9,
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 1,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    letterSpacing: -0.3,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    letterSpacing: -0.3,
  },
  seeAllButtonContainer: {
    ...glassStyles.pillContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  seeAllButton: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
  },
  tripsCarousel: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 20,
  },
  quickActionsSection: {
    paddingHorizontal: 24,
  },
  actionsContainer: {
    gap: 12,
  },
});
