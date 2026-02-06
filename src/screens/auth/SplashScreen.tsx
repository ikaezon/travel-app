import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  fontFamilies,
  glassStyles,
  glassConstants,
  glassColors,
  glassShadows,
} from '../../theme';
import { mockImages } from '../../data/mocks';
import { usePressAnimation } from '../../hooks';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.max(SCREEN_HEIGHT * 0.45, 360);
const TOP_BLEED = 160;

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const emailAnim = usePressAnimation();
  const appleAnim = usePressAnimation();
  const googleAnim = usePressAnimation();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: TOP_BLEED, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          
        >
          <View style={[styles.heroContainer, { height: TOP_BLEED + HERO_HEIGHT }]}>
            <ImageBackground
              source={{ uri: mockImages.splashBackground }}
              style={styles.heroImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={[
                  colors.gradient.start,
                  'rgba(241, 245, 249, 0)',
                  'transparent',
                  'rgba(0, 0, 0, 0.55)',
                ]}
                locations={[0, 0.3, 0.6, 1]}
                style={styles.gradient}
              />
            </ImageBackground>

            {/* Logo – liquid glass circle */}
            <View style={styles.logoOuterContainer}>
              <BlurView
                intensity={glassConstants.blur.card}
                tint="light"
                style={[StyleSheet.absoluteFill, glassStyles.blurContentPill]}
              />
              <View style={styles.glassOverlay} pointerEvents="none" />
              <View style={styles.logoInnerContainer}>
                <BlurView
                  intensity={glassConstants.blur.icon}
                  tint="light"
                  style={[StyleSheet.absoluteFill, glassStyles.blurContentPill]}
                />
                <View style={styles.glassOverlay} pointerEvents="none" />
                <MaterialIcons
                  name="flight"
                  size={44}
                  color={colors.primary}
                  style={styles.logoIcon}
                />
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

          {/* Actions – directly on gradient, like dashboard QuickActionCards */}
          <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
            {/* Primary button – boarding pass glass style */}
            <Animated.View style={{ transform: [{ scale: emailAnim.scaleAnim }] }}>
            <Pressable
              style={styles.primaryButton}
              onPress={onEmailPress}
              onPressIn={emailAnim.onPressIn}
              onPressOut={emailAnim.onPressOut}
            >
              <BlurView
                intensity={glassConstants.blur.card}
                tint="light"
                style={[StyleSheet.absoluteFill, glassStyles.blurContent]}
              />
              <View style={styles.primaryOverlay} pointerEvents="none" />
              <View style={styles.primaryContent}>
                <MaterialIcons name="mail" size={20} color={colors.primary} />
                <Text style={styles.primaryButtonText}>Continue with Email</Text>
              </View>
            </Pressable>
            </Animated.View>

            {/* Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Secondary button – Apple (glass card) */}
            <Animated.View style={{ transform: [{ scale: appleAnim.scaleAnim }] }}>
            <Pressable
              style={styles.secondaryButton}
              onPress={onApplePress}
              onPressIn={appleAnim.onPressIn}
              onPressOut={appleAnim.onPressOut}
            >
              <BlurView
                intensity={glassConstants.blur.card}
                tint="light"
                style={[StyleSheet.absoluteFill, glassStyles.blurContent]}
              />
              <View style={styles.glassOverlay} pointerEvents="none" />
              <View style={styles.secondaryContent}>
                <MaterialIcons name="smartphone" size={22} color={colors.text.primary.light} />
                <Text style={styles.secondaryButtonText}>Continue with Apple</Text>
              </View>
            </Pressable>
            </Animated.View>

            {/* Secondary button – Google (glass card) */}
            <Animated.View style={{ transform: [{ scale: googleAnim.scaleAnim }] }}>
            <Pressable
              style={styles.secondaryButton}
              onPress={onGooglePress}
              onPressIn={googleAnim.onPressIn}
              onPressOut={googleAnim.onPressOut}
            >
              <BlurView
                intensity={glassConstants.blur.card}
                tint="light"
                style={[StyleSheet.absoluteFill, glassStyles.blurContent]}
              />
              <View style={styles.glassOverlay} pointerEvents="none" />
              <View style={styles.secondaryContent}>
                <MaterialIcons name="language" size={22} color={colors.text.primary.light} />
                <Text style={styles.secondaryButtonText}>Continue with Google</Text>
              </View>
            </Pressable>
            </Animated.View>

            {/* Footer */}
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
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  // ── Hero ──────────────────────────────────────
  heroContainer: {
    alignItems: 'center',
    width: '100%',
  },
  heroImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
    width: '100%',
  },

  // ── Shared glass overlay (identical to TripDashboardScreen) ──
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },

  // ── Logo (liquid glass) ───────────────────────
  logoOuterContainer: {
    marginTop: -56,
    zIndex: 10,
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.card,
    borderColor: glassColors.border,
    boxShadow: glassShadows.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInnerContainer: {
    height: 80,
    width: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.icon,
    borderColor: glassColors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: glassShadows.icon,
  },
  logoIcon: {
    transform: [{ rotate: '-45deg' }],
  },

  // ── Headline ──────────────────────────────────
  headlineContainer: {
    width: '100%',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
    maxWidth: 448,
  },
  title: {
    fontSize: 32,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Actions (no outer card, directly on gradient) ──
  actionsContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },

  // ── Primary button (matches See All / nav icon style) ──
  primaryButton: {
    ...glassStyles.cardWrapper,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryOverlay: {
    ...glassStyles.cardOverlay,
  },
  primaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 1,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
    letterSpacing: 0.3,
  },

  // ── Secondary buttons (identical glass card pattern) ──
  secondaryButton: {
    ...glassStyles.cardWrapper,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
    letterSpacing: 0.24,
  },

  // ── Shared ────────────────────────────────────

  // ── Separator ─────────────────────────────────
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  separatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: glassColors.menuItemBorder,
  },
  separatorText: {
    fontSize: 11,
    fontFamily: fontFamilies.semibold,
    color: colors.text.tertiary.light,
    letterSpacing: 1.5,
  },

  // ── Footer ────────────────────────────────────
  footer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    color: colors.text.tertiary.light,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
});
