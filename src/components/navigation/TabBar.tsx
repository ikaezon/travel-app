import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontFamilies, glassStyles, glassColors } from '../../theme';

// ============================================
// SPRING PHYSICS
// ============================================

// Slide spring — fluid with slight overshoot (iOS 26 feel)
const SLIDE_SPRING = {
  tension: 180,
  friction: 22,
  useNativeDriver: true,
};

// Press scale spring — snappy, responsive
const PRESS_SPRING = {
  tension: 280,
  friction: 14,
  useNativeDriver: true,
};

// Release scale spring — settles smoothly
const RELEASE_SPRING = {
  tension: 200,
  friction: 18,
  useNativeDriver: true,
};

// ============================================
// LAYOUT CONSTANTS
// ============================================

const TAB_CONFIG: Record<string, { icon: 'home' | 'person'; label: string }> = {
  Home: { icon: 'home', label: 'Home' },
  Profile: { icon: 'person', label: 'Profile' },
};

const BAR_HEIGHT = 64;
const PILL_WIDTH = 72;
const PILL_HEIGHT = 52;
const PILL_PADDING = 6;

/** How much the pill grows when finger is pressed down */
const PRESS_SCALE = 1.12;

// ============================================
// MAIN TABBAR COMPONENT
// ============================================

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, spacing.lg);

  // ── Layout measurements ──
  const tabCenters = useRef<number[]>([]);
  const isInitialized = useRef(false);

  // ── Animated values ──
  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(1)).current;
  const isDragging = useRef(false);
  const startIndex = useRef(state.index);
  const currentTranslateX = useRef(0);

  // Track current translateX for pan gesture calculations
  useEffect(() => {
    const id = pillTranslateX.addListener(({ value }) => {
      currentTranslateX.current = value;
    });
    return () => pillTranslateX.removeListener(id);
  }, [pillTranslateX]);

  // ── Helpers ──
  const getTranslateXForTab = useCallback((index: number): number | undefined => {
    const centerX = tabCenters.current[index];
    if (centerX === undefined) return undefined;
    return centerX - PILL_WIDTH / 2;
  }, []);

  const findNearestTab = useCallback((centerX: number): number => {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    tabCenters.current.forEach((center, index) => {
      const distance = Math.abs(centerX - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  }, []);

  const navigateToTab = useCallback(
    (index: number) => {
      const route = state.routes[index];
      if (!route) return;
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (state.index !== index && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [navigation, state.routes, state.index],
  );

  const triggerHaptic = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // ── Animate pill to tab ──
  const animatePillToTab = useCallback(
    (index: number, animate = true) => {
      const translateX = getTranslateXForTab(index);
      if (translateX === undefined) return;

      if (animate) {
        Animated.spring(pillTranslateX, {
          ...SLIDE_SPRING,
          toValue: translateX,
        }).start();
      } else {
        pillTranslateX.setValue(translateX);
      }
    },
    [pillTranslateX, getTranslateXForTab],
  );

  // ── Scale animations for press ──
  const scaleUp = useCallback(() => {
    Animated.spring(pillScale, {
      ...PRESS_SPRING,
      toValue: PRESS_SCALE,
    }).start();
  }, [pillScale]);

  const scaleDown = useCallback(() => {
    Animated.spring(pillScale, {
      ...RELEASE_SPRING,
      toValue: 1,
    }).start();
  }, [pillScale]);

  // ── Layout handler ──
  const handleTabLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      const center = x + width / 2;
      tabCenters.current[index] = center;

      // Initialize pill position once all tabs are measured
      if (index === state.routes.length - 1 && !isInitialized.current) {
        isInitialized.current = true;
        animatePillToTab(state.index, false);
      }
    },
    [state.index, state.routes.length, animatePillToTab],
  );

  // ── Sync pill when state.index changes externally ──
  useEffect(() => {
    if (!isDragging.current && isInitialized.current) {
      animatePillToTab(state.index, true);
    }
  }, [state.index, animatePillToTab]);

  // ── Tab press handler ──
  const handleTabPress = useCallback(
    (index: number) => {
      triggerHaptic();
      animatePillToTab(index, true);
      navigateToTab(index);
    },
    [animatePillToTab, navigateToTab, triggerHaptic],
  );

  // ── PanResponder for dragging the pill ──
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        startIndex.current = state.index;
        scaleUp();
      },
      onPanResponderMove: (_, gestureState) => {
        const startTranslateX = getTranslateXForTab(startIndex.current);
        if (startTranslateX === undefined) return;

        const targetTranslateX = startTranslateX + gestureState.dx;

        // Clamp to valid range
        const firstTranslateX = getTranslateXForTab(0);
        const lastTranslateX = getTranslateXForTab(tabCenters.current.length - 1);
        if (firstTranslateX === undefined || lastTranslateX === undefined) return;

        const clampedTranslateX = Math.max(
          firstTranslateX,
          Math.min(lastTranslateX, targetTranslateX),
        );
        pillTranslateX.setValue(clampedTranslateX);
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        scaleDown();

        // Calculate current pill center from translateX
        const currentPillCenter = currentTranslateX.current + PILL_WIDTH / 2;
        const nearestIndex = findNearestTab(currentPillCenter);

        // Animate to nearest tab
        animatePillToTab(nearestIndex, true);

        // Navigate if different
        if (nearestIndex !== state.index) {
          triggerHaptic();
          navigateToTab(nearestIndex);
        }
      },
    }),
  ).current;

  return (
    <View style={[styles.outerContainer, { bottom: bottomOffset }]}>
      <View style={styles.barWrapper}>
        {/* Animated pill indicator — can overflow when scaled */}
        <Animated.View
          style={[
            styles.pill,
            {
              transform: [
                { translateX: pillTranslateX },
                { scale: pillScale },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <BlurView intensity={45} tint="light" style={styles.pillBlur}>
            <View style={styles.pillOverlay} />
          </BlurView>
        </Animated.View>

        {/* Glass bar background */}
        <BlurView
          intensity={24}
          tint="light"
          style={[styles.blurContainer, glassStyles.blurContentLarge]}
        >
          <View style={styles.glassOverlay} pointerEvents="none" />
        </BlurView>

        {/* Tab items with pan responder on container */}
        <View style={styles.tabBar} {...panResponder.panHandlers}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name] || { icon: 'home', label: route.name };

            return (
              <Pressable
                key={route.key}
                style={styles.tabItem}
                onLayout={(e) => handleTabLayout(index, e)}
                onPressIn={scaleUp}
                onPressOut={scaleDown}
                onPress={() => handleTabPress(index)}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              >
                <MaterialIcons
                  name={config.icon}
                  size={24}
                  color={isFocused ? colors.primary : colors.text.tertiary.light}
                />
                <Text
                  style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}
                >
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  barWrapper: {
    width: '90%',
    maxWidth: 340,
    height: BAR_HEIGHT,
    position: 'relative',
    overflow: 'visible', // Allow pill to overflow when scaled
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    ...glassStyles.navBarWrapper,
    zIndex: 0,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  tabBar: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: PILL_PADDING,
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
    height: '100%',
  },
  label: {
    fontSize: 10,
    fontFamily: fontFamilies.semibold,
  },
  labelActive: {
    color: colors.primary,
  },
  labelInactive: {
    color: colors.text.tertiary.light,
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: PILL_PADDING,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  pillBlur: {
    flex: 1,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: glassColors.borderStrong,
  },
  pillOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
});
