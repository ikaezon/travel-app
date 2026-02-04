import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../theme';
import { mockImages } from '../../data/mocks';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.max(SCREEN_HEIGHT * 0.45, 360);
// Extra height above the fold so overscroll reveals soft gradient, not a flat crop line
const TOP_BLEED = 280;

interface SplashScreenProps {
  onEmailPress?: () => void;
  onApplePress?: () => void;
  onGooglePress?: () => void;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
}

export default function SplashScreen({
  onEmailPress,
  onApplePress,
  onGooglePress,
  onTermsPress,
  onPrivacyPress,
}: SplashScreenProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: TOP_BLEED, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroContainer, { height: TOP_BLEED + HERO_HEIGHT }]}>
          <ImageBackground
            source={{
              uri: mockImages.splashBackground,
            }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                colors.background.light,
                'rgba(246,247,248,0)',
                'transparent',
                'rgba(0,0,0,0.6)',
              ]}
              locations={[0, 0.35, 0.65, 1]}
              style={styles.gradient}
            />
          </ImageBackground>

          <View style={styles.logoOuterContainer}>
            <View style={styles.logoInnerContainer}>
              <MaterialIcons name="flight" size={48} color={colors.primary} style={styles.logoIcon} />
            </View>
          </View>

          <View style={styles.headlineContainer}>
            <Text style={styles.title}>
              Your Travel{'\n'}Command Center
            </Text>
            <Text style={styles.subtitle}>
              Organize your entire journey from takeoff to landing in one minimalist space.
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onEmailPress}
          >
            <MaterialIcons name="mail" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Continue with Email</Text>
          </Pressable>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onApplePress}
          >
            <MaterialIcons name="smartphone" size={24} color="#111618" />
            <Text style={styles.secondaryButtonText}>Continue with Apple</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onGooglePress}
          >
            <MaterialIcons name="language" size={24} color="#111618" />
            <Text style={styles.secondaryButtonText}>Continue with Google</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing up, you agree to our{' '}
              <Text style={styles.footerLink} onPress={onTermsPress}>
                Terms
              </Text>
              {' and '}
              <Text style={styles.footerLink} onPress={onPrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  heroContainer: {
    alignItems: 'center',
    width: '100%',
  },
  heroImage: {
    flex: 1,
    width: '100%',
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  logoOuterContainer: {
    marginTop: -56,
    zIndex: 10,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoInnerContainer: {
    height: 96,
    width: 96,
    backgroundColor: colors.white,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  headlineContainer: {
    width: '100%',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
    maxWidth: 448,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary.light,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsContainer: {
    width: '100%',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
    paddingTop: spacing.lg,
    maxWidth: 448,
    alignSelf: 'center',
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.24,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.md,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: 0.24,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    opacity: 0.5,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  separatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary.light,
    letterSpacing: 1.2,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.text.tertiary.light,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
