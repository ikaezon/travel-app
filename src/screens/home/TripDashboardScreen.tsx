import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TripCard } from '../../components/domain/TripCard';
import { pickImageFromLibrary } from '../../native';
import { QuickActionCard } from '../../components/domain/QuickActionCard';
import { FadeInView, LoadingView, ErrorView } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { QUICK_ACTION_ROUTES } from '../../constants';
import { useCurrentUser, useUpcomingTrips, useQuickActions } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function TripDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingView />
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorView
          title="Unable to load your dashboard"
          subtitle="Please try again in a moment."
          onRetry={handleRetry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FadeInView duration={150} delay={0}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.profileContainer}>
              <Image 
                source={{ uri: user?.photoUrl }} 
                style={styles.profileImage} 
              />
              <View style={styles.onlineBadge} />
            </Pressable>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'Traveler'}</Text>
            </View>
          </View>

          <Pressable style={styles.notificationButton}>
            <MaterialIcons name="notifications" size={24} color={colors.text.primary.light} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </FadeInView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Trips</Text>
            <Pressable onPress={handleSeeAllPress}>
              <Text style={styles.seeAllButton}>See All</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripsCarousel}
            snapToInterval={296}
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
                iconName={action.iconName as keyof typeof MaterialIcons.glyphMap}
                iconColor={action.iconColor}
                iconBgColor={action.iconBgColor}
                onPress={() => handleQuickActionPress(action.route)}
                delay={trips.length * 60 + index * 50}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(246, 247, 248, 0.9)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: colors.status.success,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background.light,
  },
  greetingContainer: {
    gap: spacing.xxs,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary.light,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: colors.status.error,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.xxl,
    paddingBottom: 100,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary.light,
    lineHeight: 28,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  tripsCarousel: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
  },
  actionsContainer: {
    gap: spacing.md,
  },
});
