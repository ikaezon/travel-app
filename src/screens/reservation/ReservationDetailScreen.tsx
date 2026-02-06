import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatCard } from '../../components/ui/StatCard';
import { DetailRow } from '../../components/ui/DetailRow';
import { GlassDropdownMenu } from '../../components/ui/GlassDropdownMenu';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId } from '../../hooks';
import { colors, spacing, fontFamilies, glassStyles, glassColors, glassConstants, glassShadows } from '../../theme';
import { deleteReservationWithTimeline } from '../../data';
import { shortenCountryInAddress } from '../../utils/addressFormat';
import { formatReservationDateDisplay, getReservationDisplayAddress } from '../../utils/reservationFormat';
import type { Reservation } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type ReservationDetailRouteProp = RouteProp<MainStackParamList, 'ReservationDetail'>;

function getReservationStatusConfig(status: Reservation['status']) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', bgColor: colors.status.successLight, textColor: colors.status.success };
    case 'pending':
      return { label: 'Pending', bgColor: colors.status.warningLight, textColor: colors.status.warning };
    case 'cancelled':
      return { label: 'Cancelled', bgColor: colors.status.errorLight, textColor: colors.status.error };
    default:
      return { label: 'Unknown', bgColor: colors.border.light, textColor: colors.text.tertiary.light };
  }
}

export default function ReservationDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReservationDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const timelineItemId = route.params?.timelineItemId || '';

  const { reservation, isLoading, error, refetch } = useReservationByTimelineId(timelineItemId);
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleEditReservation = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('EditReservation', { timelineItemId });
  }, [navigation, timelineItemId]);

  const handleAddAttachments = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('ReservationAttachments', { timelineItemId });
  }, [navigation, timelineItemId]);

  const handleDeleteReservation = useCallback(() => {
    setMenuVisible(false);
    if (!reservation) return;
    Alert.alert(
      'Delete reservation',
      'This will remove this reservation from the trip timeline and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReservationWithTimeline(reservation.id, timelineItemId);
              navigation.goBack();
            } catch (e) {
              const message = e instanceof Error ? e.message : 'Failed to delete reservation.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  }, [reservation, timelineItemId, navigation]);

  const handleMenuSelect = useCallback(
    (index: number) => {
      if (index === 0) handleEditReservation();
      if (index === 1) handleAddAttachments();
      if (index === 2) handleDeleteReservation();
    },
    [handleEditReservation, handleAddAttachments, handleDeleteReservation]
  );

  const directionsAddress = reservation ? getReservationDisplayAddress(reservation) : null;

  const handleOpenDirections = useCallback(() => {
    if (!directionsAddress) {
      Alert.alert('No Address', 'No address available for directions.');
      return;
    }

    const encodedAddress = encodeURIComponent(directionsAddress);
    
    // Use Apple Maps on iOS, Google Maps on Android
    const url = Platform.select({
      ios: `maps://maps.apple.com/?daddr=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://maps.apple.com/?daddr=${encodedAddress}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to web URL
        Linking.openURL(`https://maps.apple.com/?daddr=${encodedAddress}`);
      }
    });
  }, [directionsAddress]);

  const topOffset = insets.top + 8;
  const showContent = Boolean(!isLoading && !error && reservation);
  const headerTitle = reservation?.providerName || 'Reservation Details';
  const statusConfig = reservation ? getReservationStatusConfig(reservation.status) : null;

  const displayAddress = useMemo(() => {
    if (!reservation) return '';
    const addr = getReservationDisplayAddress(reservation);
    return addr ? shortenCountryInAddress(addr) : '';
  }, [reservation]);

  const dateDisplayText = useMemo(() => {
    if (!reservation) return '';
    return formatReservationDateDisplay(reservation);
  }, [reservation]);

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <View style={[styles.loadingContainer, { paddingTop: topOffset + 72 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  } else if (error) {
    content = (
      <View style={[styles.errorContainer, { paddingTop: topOffset + 72 }]}>
        <MaterialIcons name="error-outline" size={32} color={colors.status.error} />
        <Text style={styles.errorTitle}>Unable to load reservation</Text>
        <Text style={styles.errorSubtitle}>Please try again in a moment.</Text>
      </View>
    );
  } else if (!reservation) {
    content = (
      <View style={[styles.errorContainer, { paddingTop: topOffset + 72 }]}>
        <Text style={styles.errorText}>Reservation not found</Text>
      </View>
    );
  } else {
    content = (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topOffset + 72 }]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={[StyleSheet.absoluteFill, styles.heroCardBg]} pointerEvents="none" />
            <ImageBackground
              source={{ uri: reservation.headerImageUrl }}
              style={styles.heroImage}
              imageStyle={styles.heroImageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
                style={styles.heroGradient}
              >
                <View style={styles.heroContent}>
                  <Text style={styles.airlineName}>{reservation.providerName}</Text>
                  {reservation.operatedBy && (
                    <Text style={styles.operatedBy}>{reservation.operatedBy}</Text>
                  )}
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>
        </View>

        <View style={styles.headlineSection}>
          <View style={styles.headlineContent}>
            <View style={styles.headlineLeft}>
              <Text style={styles.route}>
                {reservation.type === 'hotel' ? reservation.providerName : reservation.route}
              </Text>
              <Text style={styles.dateInfo}>{dateDisplayText}</Text>
            </View>
            {statusConfig && (
              <View style={[styles.statusBadge, styles.statusBadgeSolid, { backgroundColor: statusConfig.bgColor }]}>
                <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                  {statusConfig.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {reservation.type === 'flight' && (
          <View style={styles.statsGrid}>
            <StatCard label="Terminal" value={reservation.terminal || '-'} iconName="meeting-room" />
            <StatCard label="Gate" value={reservation.gate || '-'} iconName="door-sliding" />
            <StatCard label="Seat" value={reservation.seat || '-'} iconName="airline-seat-recline-extra" />
          </View>
        )}

        <View style={styles.detailsSection}>
          <View style={styles.detailsCard}>
            <View style={[StyleSheet.absoluteFill, styles.cardSolidBg]} pointerEvents="none" />
            <View style={styles.detailsList}>
              <DetailRow
                label="Confirmation"
                value={reservation.confirmationCode}
                valueColor={colors.primary}
                isMonospace
                showBorder={reservation.type === 'flight' || Boolean(reservation.vehicleInfo)}
              />
              {reservation.type === 'flight' && (
                <>
                  <DetailRow
                    label="Flight Status"
                    value="On Time"
                    valueColor={colors.status.success}
                    showBorder
                  />
                  <DetailRow
                    label="Cabin Class"
                    value="Delta One Suite"
                    showBorder={Boolean(reservation.vehicleInfo)}
                  />
                </>
              )}
              {reservation.vehicleInfo && (
                <DetailRow
                  label={reservation.type === 'flight' ? 'Aircraft' : 'Vehicle'}
                  value={reservation.vehicleInfo}
                  showBorder={Boolean(directionsAddress)}
                />
              )}
              {directionsAddress && (
                <Pressable onPress={handleOpenDirections}>
                  <DetailRow
                    label="Address"
                    value={displayAddress}
                    valueColor={colors.primary}
                    showBorder={false}
                  />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {reservation.attachments && reservation.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={styles.attachmentsTitle}>Attachments</Text>
            {reservation.attachments.map((attachment) => (
              <Pressable
                key={attachment.id}
                style={({ pressed }) => [
                  styles.attachmentCard,
                  pressed && styles.attachmentCardPressed,
                ]}
              >
                <View style={[StyleSheet.absoluteFill, styles.cardSolidBg]} pointerEvents="none" />
                {attachment.thumbnailUrl && (
                  <Image
                    source={{ uri: attachment.thumbnailUrl }}
                    style={styles.attachmentThumbnail}
                  />
                )}
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Text style={styles.attachmentMeta}>
                    Added {attachment.date} • {attachment.size}
                  </Text>
                </View>
                <Pressable hitSlop={8}>
                  <MaterialIcons name="download" size={24} color={colors.primary} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.bottomActions}>
          <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}>
            <View style={[StyleSheet.absoluteFill, styles.actionButtonBg]} pointerEvents="none" />
            <MaterialIcons name="calendar-today" size={20} color={colors.text.primary.light} />
            <Text style={styles.actionButtonText}>Calendar</Text>
          </Pressable>
          {directionsAddress && (
            <Pressable 
              style={({ pressed }) => [styles.actionButton, styles.actionButtonPrimary, pressed && styles.actionButtonPressed]}
              onPress={handleOpenDirections}
            >
              <View style={[StyleSheet.absoluteFill, styles.actionButtonBg, styles.actionButtonBgPrimary]} pointerEvents="none" />
              <MaterialIcons name="directions" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>Directions</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
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
        {showContent && menuVisible && (
          <Pressable
            style={styles.menuScrim}
            onPress={() => setMenuVisible(false)}
            accessibilityLabel="Close menu"
          />
        )}

        <View style={[styles.topNavContainer, { top: topOffset }]}>
          <BlurView intensity={16} tint="light" style={[styles.topNavBlur, glassStyles.blurContentLarge]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.topNavContent}>
              <Pressable
                style={({ pressed }) => pressed && styles.navButtonPressed}
                onPress={handleBackPress}
                accessibilityLabel="Go back"
              >
                <View style={styles.navButton}>
                  <MaterialIcons name="arrow-back" size={22} color={colors.text.primary.light} />
                </View>
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={styles.headerLabel}>Reservation</Text>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {headerTitle}
                </Text>
              </View>

              {showContent ? (
                <Pressable
                  style={({ pressed }) => pressed && styles.navButtonPressed}
                  onPress={() => setMenuVisible(true)}
                  accessibilityLabel="More options"
                >
                  <View style={styles.navButton}>
                    <MaterialIcons name="more-horiz" size={22} color={colors.text.primary.light} />
                  </View>
                </Pressable>
              ) : (
                <View style={styles.navButton} />
              )}
            </View>
          </BlurView>
        </View>

        {showContent && (
          <GlassDropdownMenu
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            actions={[
              { label: 'Edit reservation', icon: 'edit' },
              { label: 'Add attachments', icon: 'attach-file' },
              { label: 'Delete', icon: 'delete-outline', destructive: true },
            ]}
            onSelect={handleMenuSelect}
            style={[styles.menuDropdown, { top: topOffset + 64 }]}
            uniformItemBackground
          />
        )}

        {content}
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
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
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
  errorText: {
    fontSize: 16,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
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
    maxWidth: 360,
    borderWidth: 1,
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
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
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
  menuScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: 'transparent',
  },
  menuDropdown: {
    position: 'absolute',
    right: 24,
    zIndex: 70,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 16,
  },
  heroSection: {
    paddingHorizontal: 20,
  },
  heroCardBg: {
    backgroundColor: colors.glass.background,
    borderRadius: glassConstants.radiusInner.cardXLarge,
  },
  heroCard: {
    ...glassStyles.cardWrapperLarge,
    minHeight: 220,
    borderWidth: 1,
    boxShadow: glassShadows.elevated,
  },
  heroImage: {
    width: '100%',
    minHeight: 220,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    borderRadius: glassConstants.radius.cardXLarge,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 24,
  },
  airlineName: {
    fontSize: 30,
    fontFamily: fontFamilies.semibold,
    color: 'white',
    letterSpacing: -0.5,
  },
  operatedBy: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  headlineSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headlineContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headlineLeft: {
    flex: 1,
  },
  route: {
    fontSize: 28,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  dateInfo: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary.light,
    marginTop: 4,
  },
  statusBadge: {
    ...glassStyles.pillContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderColor: glassColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  statusBadgeSolid: {
    opacity: 0.9,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  detailsSection: {
    paddingHorizontal: 20,
  },
  cardSolidBg: {
    backgroundColor: colors.glass.background,
    borderRadius: glassConstants.radiusInner.card,
  },
  detailsCard: {
    ...glassStyles.cardWrapper,
    borderWidth: glassConstants.borderWidth.cardThin,
    position: 'relative',
  },
  detailsList: {
    overflow: 'hidden',
  },
  attachmentsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  attachmentCard: {
    ...glassStyles.cardWrapper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    position: 'relative',
  },
  attachmentCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  attachmentThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.border.light,
  },
  attachmentInfo: {
    flex: 1,
    gap: 2,
  },
  attachmentName: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  attachmentMeta: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionButton: {
    ...glassStyles.pillContainer,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    position: 'relative',
  },
  actionButtonBg: {
    backgroundColor: colors.glass.background,
    borderRadius: glassConstants.radius.pill,
  },
  actionButtonBgPrimary: {
    backgroundColor: glassColors.overlayBlue,
  },
  actionButtonPrimary: {
    borderColor: glassColors.borderBlue,
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  actionButtonTextPrimary: {
    color: colors.primary,
  },
});
