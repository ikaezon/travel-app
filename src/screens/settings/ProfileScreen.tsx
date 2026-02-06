import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { SettingsListItem } from '../../components/ui/SettingsListItem';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import {
  colors,
  spacing,
  borderRadius,
  fontFamilies,
  glassStyles,
  glassColors,
} from '../../theme';
import { useProfileUser, useAppSettings, usePressAnimation } from '../../hooks';

interface ProfileScreenProps {
  onEditPress?: () => void;
  onConnectedAccountsPress?: () => void;
  onPaymentMethodsPress?: () => void;
  onNotificationsPress?: () => void;
  onPrivacyPress?: () => void;
  onHelpCenterPress?: () => void;
  onLogOutPress?: () => void;
}

export default function ProfileScreen({
  onEditPress,
  onConnectedAccountsPress,
  onPaymentMethodsPress,
  onNotificationsPress,
  onPrivacyPress,
  onHelpCenterPress,
  onLogOutPress,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { user, isLoading: userLoading } = useProfileUser();
  const { settings, isLoading: settingsLoading, updateSettings } = useAppSettings();
  const [darkMode, setDarkMode] = useState(false);

  const isLoading = userLoading || settingsLoading;
  const topOffset = insets.top + 8;
  const profileAnim = usePressAnimation();
  const signOutAnim = usePressAnimation();
  const editAnim = usePressAnimation();

  useEffect(() => {
    if (settings?.darkMode !== undefined) {
      setDarkMode(settings.darkMode);
    }
  }, [settings?.darkMode]);

  const handleDarkModeToggle = async (value: boolean) => {
    const previous = darkMode;
    setDarkMode(value);
    try {
      await updateSettings({ darkMode: value });
    } catch {
      setDarkMode(previous);
      Alert.alert(
        'Settings',
        'Could not save preference. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <View style={[styles.topNavContainer, { top: topOffset }]}>
            <BlurView intensity={24} tint="light" style={[styles.topNavBlur, glassStyles.blurContentLarge]}>
              <View style={styles.glassOverlay} pointerEvents="none" />
              <View style={styles.topNavContent}>
                <View style={styles.navButton} />
                <View style={styles.headerCenter}>
                  <Text style={styles.headerLabel}>Profile</Text>
                  <Text style={styles.headerTitle}>Settings</Text>
                </View>
                <View style={styles.navButton} />
              </View>
            </BlurView>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
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
          <View style={styles.section}>
            <Animated.View style={{ transform: [{ scale: profileAnim.scaleAnim }] }}>
            <Pressable
              style={styles.profileCardWrapper}
              onPress={onEditPress}
              onPressIn={profileAnim.onPressIn}
              onPressOut={profileAnim.onPressOut}
            >
              <BlurView intensity={24} tint="light" style={[styles.profileCardBlur, glassStyles.blurContent]}>
                <View style={styles.glassOverlay} pointerEvents="none" />
                <View style={styles.profileContent}>
                  <View style={styles.profileImageContainer}>
                    <Image source={{ uri: user?.photoUrl }} style={styles.profileImage} />
                    {user?.isPro && (
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userTitle}>{user?.title || ''}</Text>
                    <Text style={styles.memberSince}>
                      Member since {user?.memberSince || ''}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </Pressable>
            </Animated.View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>
            <View style={styles.cardsContainer}>
              <SettingsListItem
                label="Connected Accounts"
                iconName="link"
                onPress={onConnectedAccountsPress}
                variant="glass"
              />
              <SettingsListItem
                label="Payment Methods"
                iconName="credit-card"
                onPress={onPaymentMethodsPress}
                variant="glass"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>PREFERENCES</Text>
            <View style={styles.cardsContainer}>
              <SettingsListItem
                label="Notifications"
                iconName="notifications"
                onPress={onNotificationsPress}
                variant="glass"
              />
              <SettingsListItem
                label="Privacy & Security"
                iconName="lock"
                onPress={onPrivacyPress}
                variant="glass"
              />
              <SettingsListItem
                label="Dark Mode"
                iconName="dark-mode"
                showChevron={false}
                rightElement={
                  <ToggleSwitch value={darkMode} onValueChange={handleDarkModeToggle} />
                }
                variant="glass"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>SUPPORT</Text>
            <View style={styles.cardsContainer}>
              <SettingsListItem
                label="Help Center"
                iconName="help"
                onPress={onHelpCenterPress}
                variant="glass"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Animated.View style={{ transform: [{ scale: signOutAnim.scaleAnim }] }}>
            <Pressable
              style={styles.signOutCardWrapper}
              onPress={onLogOutPress}
              onPressIn={signOutAnim.onPressIn}
              onPressOut={signOutAnim.onPressOut}
            >
              <BlurView intensity={24} tint="light" style={[styles.signOutBlur, glassStyles.blurContent]}>
                <View style={[styles.glassOverlay, styles.signOutOverlay]} pointerEvents="none" />
                <View style={styles.signOutContent}>
                  <MaterialIcons name="logout" size={20} color={colors.status.error} />
                  <Text style={styles.signOutText}>Log Out</Text>
                </View>
              </BlurView>
            </Pressable>
            </Animated.View>
            <Text style={styles.versionText}>
              Version {settings?.appVersion || '1.0.0'}
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.topNavContainer, { top: topOffset }]}>
          <BlurView intensity={24} tint="light" style={[styles.topNavBlur, glassStyles.blurContentLarge]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.topNavContent}>
              <View style={styles.navButton} />
              <View style={styles.headerCenter}>
                <Text style={styles.headerLabel}>Profile</Text>
                <Text style={styles.headerTitle}>Settings</Text>
              </View>
              <Animated.View style={{ transform: [{ scale: editAnim.scaleAnim }] }}>
              <Pressable
                style={styles.navButton}
                onPress={onEditPress}
                onPressIn={editAnim.onPressIn}
                onPressOut={editAnim.onPressOut}
              >
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
              </Animated.View>
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
    width: 48,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
  editText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 12,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.secondary.light,
    paddingLeft: 4,
  },
  cardsContainer: {
    gap: 12,
  },
  profileCardWrapper: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
  },
  profileCardBlur: {
    padding: spacing.lg,
    position: 'relative',
  },
  profileContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  proBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.white,
  },
  proBadgeText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.white,
  },
  userInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  userName: {
    fontSize: 22,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  userTitle: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  signOutCardWrapper: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  signOutBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: spacing.sm,
    position: 'relative',
  },
  signOutOverlay: {
    backgroundColor: 'rgba(254, 226, 226, 0.4)',
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.status.error,
  },
  versionText: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    color: colors.text.tertiary.light,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
