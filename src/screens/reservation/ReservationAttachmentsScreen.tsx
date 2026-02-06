import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, fontFamilies } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId, useCreateAttachment } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'ReservationAttachments'>;
type ReservationAttachmentsRouteProp = RouteProp<MainStackParamList, 'ReservationAttachments'>;

export default function ReservationAttachmentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReservationAttachmentsRouteProp>();
  const timelineItemId = route.params?.timelineItemId ?? '';
  const { reservation, isLoading } = useReservationByTimelineId(timelineItemId);
  const { createAttachment, isCreating: uploading } = useCreateAttachment();

  const openCameraRoll = async () => {
    if (!reservation) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo access',
        'Allow access to your photos to add attachments to this reservation.',
        [{ text: 'OK' }]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    const fileName = result.assets[0].fileName ?? `attachment_${Date.now()}.jpg`;
    try {
      // Use hook instead of direct service call
      await createAttachment(reservation.id, uri, fileName);
      navigation.goBack();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to upload attachment.';
      Alert.alert('Upload failed', message);
    }
  };

  const handleBackPress = () => navigation.goBack();

  if (isLoading || !reservation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.title}>Add attachments</Text>
          <View style={styles.headerSpacer} />
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
        <Pressable
          style={styles.backButton}
          onPress={handleBackPress}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
        </Pressable>
        <Text style={styles.title}>Add attachments</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <MaterialIcons name="attach-file" size={64} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Add a photo or document</Text>
        <Text style={styles.subtext}>
          Choose from your camera roll to attach to this reservation.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            uploading && styles.primaryButtonDisabled,
          ]}
          onPress={openCameraRoll}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <MaterialIcons name="photo-library" size={24} color={colors.white} />
              <Text style={styles.primaryButtonText}>Open camera roll</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.light,
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
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  headerSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 20,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    minWidth: 240,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.white,
  },
});
