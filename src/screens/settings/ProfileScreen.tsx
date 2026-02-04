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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { SettingsListItem } from '../../components/ui/SettingsListItem';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { colors, spacing, borderRadius } from '../../theme';
import { useProfileUser, useAppSettings } from '../../hooks';

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
  const { user, isLoading: userLoading } = useProfileUser();
  const { settings, isLoading: settingsLoading, updateSettings } = useAppSettings();
  const [darkMode, setDarkMode] = useState(false);

  const isLoading = userLoading || settingsLoading;

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile</Text>
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
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable style={styles.editButton} onPress={onEditPress}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileContent}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: user?.photoUrl }} 
                style={styles.profileImage} 
              />
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
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>
        <SettingsListItem
          label="Connected Accounts"
          iconName="link"
          onPress={onConnectedAccountsPress}
        />
        <SettingsListItem
          label="Payment Methods"
          iconName="credit-card"
          onPress={onPaymentMethodsPress}
        />

        <View style={styles.sectionDivider}>
          <View style={styles.divider} />
        </View>

        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <SettingsListItem
          label="Notifications"
          iconName="notifications"
          onPress={onNotificationsPress}
        />
        <SettingsListItem
          label="Privacy & Security"
          iconName="lock"
          onPress={onPrivacyPress}
        />
        <SettingsListItem
          label="Dark Mode"
          iconName="dark-mode"
          showChevron={false}
          rightElement={
            <ToggleSwitch value={darkMode} onValueChange={handleDarkModeToggle} />
          }
        />

        <Text style={styles.sectionHeader}>SUPPORT</Text>
        <SettingsListItem label="Help Center" iconName="help" onPress={onHelpCenterPress} />

        <View style={styles.signOutSection}>
          <Pressable
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
            onPress={onLogOutPress}
          >
            <MaterialIcons name="logout" size={20} color={colors.status.error} />
            <Text style={styles.signOutText}>Log Out</Text>
          </Pressable>
          <Text style={styles.versionText}>
            Version {settings?.appVersion || '1.0.0'}
          </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.3,
  },
  editButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  editText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileHeader: {
    padding: spacing.lg,
    marginTop: spacing.lg,
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
    fontWeight: '700',
    color: colors.white,
  },
  userInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  userTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.secondary.light,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  memberSince: {
    fontSize: 12,
    color: colors.text.secondary.light,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  sectionDivider: {
    paddingHorizontal: spacing.xxl,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.secondary.light,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xxl,
  },
  signOutSection: {
    padding: spacing.xxl,
    marginTop: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  signOutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.status.errorLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  signOutButtonPressed: {
    backgroundColor: '#fee2e2',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.status.error,
  },
  versionText: {
    fontSize: 12,
    color: colors.text.tertiary.light,
    textAlign: 'center',
  },
});
