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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatCard } from '../../components/ui/StatCard';
import { DetailRow } from '../../components/ui/DetailRow';
import { GlassDropdownMenu } from '../../components/ui/GlassDropdownMenu';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId } from '../../hooks';
import { spacing, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { deleteReservationWithTimeline } from '../../data';
import { shortenCountryInAddress } from '../../utils/addressFormat';
import { formatReservationDateDisplay, getReservationDisplayAddress } from '../../utils/reservationFormat';
import type { Reservation } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type ReservationDetailRouteProp = RouteProp<MainStackParamList, 'ReservationDetail'>;

export default function ReservationDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReservationDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const timelineItemId = route.params?.timelineItemId || '';

  const getReservationStatusConfig = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', bgColor: theme.colors.status.successLight, textColor: theme.colors.status.success };
      case 'pending':
        return { label: 'Pending', bgColor: theme.colors.status.warningLight, textColor: theme.colors.status.warning };
      case 'cancelled':
        return { label: 'Cancelled', bgColor: theme.colors.status.errorLight, textColor: theme.colors.status.error };
      default:
        return { label: 'Unknown', bgColor: theme.colors.border, textColor: theme.colors.text.tertiary };
    }
  };

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
    
    const url = Platform.select({
      ios: `maps://maps.apple.com/?daddr=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://maps.apple.com/?daddr=${encodedAddress}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  } else if (error) {
    content = (
      <View style={[styles.errorContainer, { paddingTop: topOffset + 72 }]}>
        <MaterialIcons name="error-outline" size={32} color={theme.colors.status.error} />
        <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>Unable to load reservation</Text>
        <Text style={[styles.errorSubtitle, { color: theme.colors.text.secondary }]}>Please try again in a moment.</Text>
      </View>
    );
  } else if (!reservation) {
    content = (
      <View style={[styles.errorContainer, { paddingTop: topOffset + 72 }]}>
        <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>Reservation not found</Text>
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
          <View style={[styles.heroCard, { boxShadow: theme.glass.elevatedBoxShadow }, theme.glass.cardWrapperStyle]}>
            <View style={[StyleSheet.absoluteFill, styles.heroCardBg, { backgroundColor: theme.glass.fill, borderRadius: glassConstants.radiusInner.cardXLarge }]} pointerEvents="none" />
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
              <Text style={[styles.route, { color: theme.colors.text.primary }]}>
                {reservation.type === 'hotel' ? reservation.providerName : reservation.route}
              </Text>
              <Text style={[styles.dateInfo, { color: theme.colors.text.secondary }]}>{dateDisplayText}</Text>
            </View>
            {statusConfig && (
              <View style={[styles.statusBadge, styles.statusBadgeSolid, { backgroundColor: statusConfig.bgColor }, theme.glass.cardWrapperStyle]}>
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
          <View style={[styles.detailsCard, theme.glass.cardWrapperStyle]}>
            <View style={[StyleSheet.absoluteFill, styles.cardSolidBg, { backgroundColor: theme.glass.fill, borderRadius: glassConstants.radiusInner.card }]} pointerEvents="none" />
            <View style={styles.detailsList}>
              <DetailRow
                label="Confirmation"
                value={reservation.confirmationCode}
                valueColor={theme.colors.primary}
                isMonospace
                showBorder={reservation.type === 'flight' || Boolean(reservation.vehicleInfo)}
              />
              {reservation.type === 'flight' && (
                <>
                  <DetailRow
                    label="Flight Status"
                    value="On Time"
                    valueColor={theme.colors.status.success}
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
                    valueColor={theme.colors.primary}
                    showBorder={false}
                  />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {reservation.attachments && reservation.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={[styles.attachmentsTitle, { color: theme.colors.text.primary }]}>Attachments</Text>
            {reservation.attachments.map((attachment) => (
              <Pressable
                key={attachment.id}
                style={({ pressed }) => [
                  styles.attachmentCard,
                  theme.glass.cardWrapperStyle,
                  pressed && styles.attachmentCardPressed,
                ]}
              >
                <View style={[StyleSheet.absoluteFill, styles.cardSolidBg, { backgroundColor: theme.glass.fill, borderRadius: glassConstants.radiusInner.card }]} pointerEvents="none" />
                {attachment.thumbnailUrl && (
                  <Image
                    source={{ uri: attachment.thumbnailUrl }}
                    style={[styles.attachmentThumbnail, { backgroundColor: theme.colors.border }]}
                  />
                )}
                <View style={styles.attachmentInfo}>
                  <Text style={[styles.attachmentName, { color: theme.colors.text.primary }]} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Text style={[styles.attachmentMeta, { color: theme.colors.text.secondary }]}>
                    Added {attachment.date} • {attachment.size}
                  </Text>
                </View>
                <Pressable hitSlop={8}>
                  <MaterialIcons name="download" size={24} color={theme.colors.primary} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.bottomActions}>
          <Pressable style={({ pressed }) => [styles.actionButton, theme.glass.cardWrapperStyle, pressed && styles.actionButtonPressed]}>
            <View style={[StyleSheet.absoluteFill, styles.actionButtonBg, { backgroundColor: theme.glass.fill, borderRadius: glassConstants.radius.pill }]} pointerEvents="none" />
            <MaterialIcons name="calendar-today" size={20} color={theme.colors.text.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text.primary }]}>Calendar</Text>
          </Pressable>
          {directionsAddress && (
            <Pressable 
              style={({ pressed }) => [styles.actionButton, styles.actionButtonPrimary, { borderColor: theme.glass.borderBlue }, theme.isDark && { borderWidth: 0 }, pressed && styles.actionButtonPressed]}
              onPress={handleOpenDirections}
            >
              <View style={[StyleSheet.absoluteFill, styles.actionButtonBg, styles.actionButtonBgPrimary, { backgroundColor: theme.glass.overlayBlue, borderRadius: glassConstants.radius.pill }]} pointerEvents="none" />
              <MaterialIcons name="directions" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary, { color: theme.colors.primary }]}>Directions</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <GlassNavHeader
        title={headerTitle}
        label="Reservation"
        onBackPress={handleBackPress}
        rightAction={
          showContent
            ? {
                icon: 'more-horiz',
                onPress: () => setMenuVisible(true),
                accessibilityLabel: 'More options',
              }
            : undefined
        }
        showRightAction={showContent}
      />
      <View style={styles.container}>
        {showContent && menuVisible && (
          <Pressable
            style={styles.menuScrim}
            onPress={() => setMenuVisible(false)}
            accessibilityLabel="Close menu"
          />
        )}

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
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: fontFamilies.regular,
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
  },
  heroCard: {
    ...glassStyles.cardWrapperLarge,
    minHeight: 220,
    borderWidth: 1,
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
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  dateInfo: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    marginTop: 4,
  },
  statusBadge: {
    ...glassStyles.pillContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    borderRadius: glassConstants.radius.icon,
  },
  attachmentInfo: {
    flex: 1,
    gap: 2,
  },
  attachmentName: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
  },
  attachmentMeta: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
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
  },
  actionButtonBgPrimary: {
  },
  actionButtonPrimary: {
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
  },
  actionButtonTextPrimary: {
  },
});
