import React from 'react';
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
import { AdaptiveGlassView } from '../../components/ui/AdaptiveGlassView';
import { MaterialIcons } from '@expo/vector-icons';
import { SettingsListItem } from '../../components/ui/SettingsListItem';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import {
  spacing,
  borderRadius,
  fontFamilies,
  glassStyles,
} from '../../theme';
import { useProfileUser, useAppSettings, usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

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
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, isLoading: userLoading } = useProfileUser();
  const { settings, isLoading: settingsLoading } = useAppSettings();

  const isLoading = userLoading || settingsLoading;
  const topOffset = insets.top + 8;
  const profileAnim = usePressAnimation();
  const signOutAnim = usePressAnimation();
  const editAnim = usePressAnimation();

  const handleDarkModeToggle = async (value: boolean) => {
    try {
      await theme.setDarkMode(value);
    } catch {
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
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <View style={[styles.topNavContainer, { top: topOffset }]}>
            <AdaptiveGlassView intensity={24} style={[styles.topNavBlur, glassStyles.blurContentLarge, { borderColor: theme.glassColors.border, boxShadow: theme.glassShadows.nav }]}>
              {!theme.isDark && <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />}
              <View style={styles.topNavContent}>
                <View style={styles.navButton} />
                <View style={styles.headerCenter}>
                  <Text style={[styles.headerLabel, { color: theme.colors.primary }]}>Profile</Text>
                  <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Settings</Text>
                </View>
                <View style={styles.navButton} />
              </View>
            </AdaptiveGlassView>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
      </LinearGradient>
    );
  }

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
            <Animated.View style={{ transform: [{ scale: profileAnim.scaleAnim }] }}>
            <Pressable
              style={[styles.profileCardWrapper, !theme.isDark && { borderColor: theme.glassColors.border }, theme.isDark && { borderWidth: 0 }]}
              onPress={onEditPress}
              onPressIn={profileAnim.onPressIn}
              onPressOut={profileAnim.onPressOut}
            >
              <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.profileCardBlur, glassStyles.blurContent]}>
                <View style={[styles.glassOverlay, { backgroundColor: theme.isDark ? 'rgba(40, 40, 45, 0.35)' : theme.glassColors.overlayStrong }]} pointerEvents="none" />
                <View style={styles.profileContent}>
                  <View style={styles.profileImageContainer}>
                    <Image source={{ uri: user?.photoUrl }} style={[styles.profileImage, { borderColor: theme.colors.white, shadowColor: theme.colors.black }]} />
                    {user?.isPro && (
                      <View style={[styles.proBadge, { backgroundColor: theme.colors.primary, borderColor: theme.colors.white }]}>
                        <Text style={[styles.proBadgeText, { color: theme.colors.white }]}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.colors.text.primary }]}>{user?.name || 'User'}</Text>
                    <Text style={[styles.userTitle, { color: theme.colors.text.secondary }]}>{user?.title || ''}</Text>
                    <Text style={[styles.memberSince, { color: theme.colors.text.secondary }]}>
                      Member since {user?.memberSince || ''}
                    </Text>
                  </View>
                </View>
              </AdaptiveGlassView>
            </Pressable>
            </Animated.View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text.secondary }]}>ACCOUNT SETTINGS</Text>
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
            <Text style={[styles.sectionHeader, { color: theme.colors.text.secondary }]}>PREFERENCES</Text>
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
                  <ToggleSwitch value={theme.isDark} onValueChange={handleDarkModeToggle} />
                }
                variant="glass"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text.secondary }]}>SUPPORT</Text>
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
              style={[styles.signOutCardWrapper, { borderColor: theme.isDark ? 'rgba(248, 113, 113, 0.3)' : 'rgba(239, 68, 68, 0.3)' }, theme.isDark && { borderWidth: 0 }]}
              onPress={onLogOutPress}
              onPressIn={signOutAnim.onPressIn}
              onPressOut={signOutAnim.onPressOut}
            >
              <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.signOutBlur, glassStyles.blurContent]}>
                <View style={[styles.glassOverlay, styles.signOutOverlay, { backgroundColor: theme.isDark ? 'rgba(248, 113, 113, 0.08)' : 'rgba(254, 226, 226, 0.4)' }]} pointerEvents="none" />
                <View style={styles.signOutContent}>
                  <MaterialIcons name="logout" size={20} color={theme.colors.status.error} />
                  <Text style={[styles.signOutText, { color: theme.colors.status.error }]}>Log Out</Text>
                </View>
              </AdaptiveGlassView>
            </Pressable>
            </Animated.View>
            <Text style={[styles.versionText, { color: theme.colors.text.tertiary }]}>
              Version {settings?.appVersion || '1.0.0'}
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.topNavContainer, { top: topOffset }]}>
          <AdaptiveGlassView intensity={24} style={[styles.topNavBlur, glassStyles.blurContentLarge, { borderColor: theme.glassColors.border, boxShadow: theme.glassShadows.nav }]}>
            {!theme.isDark && <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />}
            <View style={styles.topNavContent}>
              <View style={styles.navButton} />
              <View style={styles.headerCenter}>
                <Text style={[styles.headerLabel, { color: theme.colors.primary }]}>Profile</Text>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Settings</Text>
              </View>
              <Animated.View style={{ transform: [{ scale: editAnim.scaleAnim }] }}>
              <Pressable
                style={styles.navButton}
                onPress={onEditPress}
                onPressIn={editAnim.onPressIn}
                onPressOut={editAnim.onPressOut}
              >
                <Text style={[styles.editText, { color: theme.colors.primary }]}>Edit</Text>
              </Pressable>
              </Animated.View>
            </View>
          </AdaptiveGlassView>
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
  editText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  proBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
  proBadgeText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
  },
  userInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  userName: {
    fontSize: 22,
    fontFamily: fontFamilies.semibold,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  userTitle: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  signOutCardWrapper: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
  },
  signOutBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 14,
    gap: spacing.sm,
    position: 'relative',
  },
  signOutOverlay: {
    // backgroundColor is now set inline with theme.isDark conditional
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
  },
  versionText: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
