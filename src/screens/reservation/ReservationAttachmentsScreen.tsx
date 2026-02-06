import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, borderRadius, fontFamilies } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MainStackParamList } from '../../navigation/types';
import { useReservationByTimelineId, useCreateAttachment, usePressAnimation } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'ReservationAttachments'>;
type ReservationAttachmentsRouteProp = RouteProp<MainStackParamList, 'ReservationAttachments'>;

export default function ReservationAttachmentsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReservationAttachmentsRouteProp>();
  const timelineItemId = route.params?.timelineItemId ?? '';
  const { reservation, isLoading } = useReservationByTimelineId(timelineItemId);
  const { createAttachment, isCreating: uploading } = useCreateAttachment();
  const primaryAnim = usePressAnimation();

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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Add attachments</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Pressable
          style={styles.backButton}
          onPress={handleBackPress}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Add attachments</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primaryLight }]}>
          <MaterialIcons name="attach-file" size={64} color={theme.colors.primary} />
        </View>
        <Text style={[styles.heading, { color: theme.colors.text.primary }]}>Add a photo or document</Text>
        <Text style={[styles.subtext, { color: theme.colors.text.secondary }]}>
          Choose from your camera roll to attach to this reservation.
        </Text>
        <Animated.View style={{ transform: [{ scale: primaryAnim.scaleAnim }] }}>
        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            uploading && styles.primaryButtonDisabled,
          ]}
          onPress={openCameraRoll}
          onPressIn={primaryAnim.onPressIn}
          onPressOut={primaryAnim.onPressOut}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <MaterialIcons name="photo-library" size={24} color={theme.colors.white} />
              <Text style={[styles.primaryButtonText, { color: theme.colors.white }]}>Open camera roll</Text>
            </>
          )}
        </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamilies.semibold,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 20,
    fontFamily: fontFamilies.semibold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    minWidth: 240,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
  },
});
