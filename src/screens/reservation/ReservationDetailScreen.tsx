import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatCard } from '../../components/ui/StatCard';
import { DetailRow } from '../../components/ui/DetailRow';
import { GlassDropdownMenu } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId } from '../../hooks';
import { getReservationStatusConfig } from '../../constants';
import { colors, spacing, borderRadius } from '../../theme';
import { reservationService, tripService } from '../../data';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type ReservationDetailRouteProp = RouteProp<MainStackParamList, 'ReservationDetail'>;

export default function ReservationDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReservationDetailRouteProp>();
  const reservationId = route.params?.reservationId || '';

  const { reservation, isLoading, error, refetch } = useReservationByTimelineId(reservationId);
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleEditReservation = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('EditReservation', { reservationId });
  }, [navigation, reservationId]);

  const handleAddAttachments = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('ReservationAttachments', { reservationId });
  }, [navigation, reservationId]);

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
              await reservationService.deleteReservation(reservation.id);
              await tripService.deleteTimelineItem(reservationId);
              navigation.goBack();
            } catch (e) {
              const message = e instanceof Error ? e.message : 'Failed to delete reservation.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  }, [reservation, reservationId, navigation]);

  const handleMenuSelect = useCallback(
    (index: number) => {
      if (index === 0) handleEditReservation();
      if (index === 1) handleAddAttachments();
      if (index === 2) handleDeleteReservation();
    },
    [handleEditReservation, handleAddAttachments, handleDeleteReservation]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackPress} accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle}>Reservation Details</Text>
          <View style={styles.headerSpacer} />
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
          <Pressable style={styles.backButton} onPress={handleBackPress} accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle}>Reservation Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={32} color={colors.status.error} />
          <Text style={styles.errorTitle}>Unable to load reservation</Text>
          <Text style={styles.errorSubtitle}>Please try again in a moment.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackPress} accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle}>Reservation Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Reservation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getReservationStatusConfig(reservation.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={handleBackPress} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
        </Pressable>
        <Text style={styles.headerTitle}>Reservation Details</Text>
        <View style={styles.headerActionWrap}>
          <Pressable
            style={({ pressed }) => [styles.headerAction, pressed && styles.headerActionPressed]}
            onPress={() => setMenuVisible(true)}
            accessibilityLabel="More options"
          >
            <MaterialIcons name="more-vert" size={24} color={colors.text.primary.light} />
          </Pressable>
          <GlassDropdownMenu
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            actions={[
              { label: 'Edit reservation', icon: 'edit' },
              { label: 'Add attachments', icon: 'attach-file' },
              { label: 'Delete', icon: 'delete-outline', destructive: true },
            ]}
            onSelect={handleMenuSelect}
            style={styles.menuDropdown}
            uniformItemBackground
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
        <View style={styles.heroSection}>
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

        <View style={styles.headlineSection}>
          <View style={styles.headlineContent}>
            <View style={styles.headlineLeft}>
              <Text style={styles.route}>{reservation.route}</Text>
              <Text style={styles.dateInfo}>
                {reservation.type === 'hotel'
                  ? reservation.duration?.includes(' - ')
                    ? reservation.duration
                    : reservation.duration === reservation.date
                      ? reservation.date
                      : `${reservation.date} • ${reservation.duration}`
                  : `${reservation.date} • ${reservation.duration}`}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {reservation.type === 'flight' && reservation.terminal && (
          <View style={styles.statsGrid}>
            <StatCard label="Terminal" value={reservation.terminal} iconName="meeting-room" />
            <StatCard label="Gate" value={reservation.gate || '-'} iconName="door-sliding" />
            <StatCard label="Seat" value={reservation.seat || '-'} iconName="airline-seat-recline-extra" />
          </View>
        )}

        {reservation.type === 'flight' && (
          <View style={styles.qrSection}>
            <View style={styles.qrContainer}>
              <View style={styles.qrCode}>
                <View style={styles.qrPattern}>
                  {[...Array(8)].map((_, row) => (
                    <View key={row} style={styles.qrRow}>
                      {[...Array(8)].map((_, col) => {
                        const isBlack = (row + col) % 2 === 0 || (row === col);
                        return (
                          <View
                            key={col}
                            style={[
                              styles.qrCell,
                              isBlack && styles.qrCellBlack,
                            ]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.qrInfo}>
                <Text style={styles.qrTitle}>Boarding Pass</Text>
                <Text style={styles.qrSubtitle}>
                  {reservation.boardingZone || 'Zone 1'} • {reservation.priority || 'Standard'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.detailsSection}>
          <View style={styles.detailsList}>
            <DetailRow
              label="Confirmation #"
              value={reservation.confirmationCode}
              isMonospace
              showBorder
            />
            {reservation.vehicleInfo && (
              <DetailRow
                label={reservation.type === 'flight' ? 'Aircraft' : 'Vehicle'}
                value={reservation.vehicleInfo}
                showBorder={false}
              />
            )}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.light,
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
  errorText: {
    fontSize: 16,
    color: colors.text.secondary.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  headerSpacer: {
    width: 32,
  },
  headerActionWrap: {
    position: 'relative',
    minWidth: 40,
    alignItems: 'flex-end',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroImage: {
    width: '100%',
    minHeight: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  heroImageStyle: {
    borderRadius: 12,
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
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  operatedBy: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  headlineSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
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
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  dateInfo: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary.light,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  qrSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  qrContainer: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    gap: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  qrCode: {
    width: 192,
    height: 192,
    backgroundColor: colors.surface.light,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPattern: {
    width: '100%',
    height: '100%',
  },
  qrRow: {
    flex: 1,
    flexDirection: 'row',
  },
  qrCell: {
    flex: 1,
    backgroundColor: 'white',
  },
  qrCellBlack: {
    backgroundColor: colors.text.primary.light,
  },
  qrInfo: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  qrSubtitle: {
    fontSize: 12,
    color: colors.text.secondary.light,
    marginTop: 4,
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsList: {
    backgroundColor: colors.surface.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  attachmentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 12,
  },
  attachmentCardPressed: {
    backgroundColor: colors.background.light,
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
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  attachmentMeta: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
});
