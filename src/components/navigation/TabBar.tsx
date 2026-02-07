import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PanResponder,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { spacing, fontFamilies, glassStyles } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from '../ui/AdaptiveGlassView';

// ============================================
// SPRING PHYSICS (Reanimated — same values as before)
// ============================================

// tension → stiffness, friction → damping (1:1 mapping, same physics model)

// Slide spring — fast snap to target
const SLIDE_SPRING = { stiffness: 750, damping: 80 };

// Press scale spring — snappy, responsive
const PRESS_SPRING = { stiffness: 400, damping: 18 };

// Release scale spring — settles quickly
const RELEASE_SPRING = { stiffness: 340, damping: 22 };

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
  const theme = useTheme();

  // ── Layout measurements ──
  const tabCenters = useRef<number[]>([]);
  const isInitialized = useRef(false);

  // ── Shared values (Reanimated — animations run on UI thread) ──
  const pillX = useSharedValue(0);
  const pillScale = useSharedValue(1);
  const isDragging = useRef(false);
  const startIndex = useRef(state.index);

  // Keep a live ref of state.index so PanResponder callbacks never read stale closures
  const liveTabIndex = useRef(state.index);
  useEffect(() => {
    liveTabIndex.current = state.index;
  }, [state.index]);

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
      // Use liveTabIndex ref to avoid stale closure when called from PanResponder
      if (liveTabIndex.current !== index && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [navigation, state.routes],
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
        pillX.value = withSpring(translateX, SLIDE_SPRING);
      } else {
        pillX.value = translateX;
      }
    },
    [pillX, getTranslateXForTab],
  );

  // ── Scale animations for press ──
  const scaleUp = useCallback(() => {
    pillScale.value = withSpring(PRESS_SCALE, PRESS_SPRING);
  }, [pillScale]);

  const scaleDown = useCallback(() => {
    pillScale.value = withSpring(1, RELEASE_SPRING);
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
        startIndex.current = liveTabIndex.current;
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
        // Set shared value directly — dispatched to UI thread via JSI
        pillX.value = clampedTranslateX;
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        scaleDown();

        // Read current pill position directly from shared value
        const currentPillCenter = pillX.value + PILL_WIDTH / 2;
        const nearestIndex = findNearestTab(currentPillCenter);

        // Animate to nearest tab
        animatePillToTab(nearestIndex, true);

        // Navigate if different (use live ref to avoid stale closure)
        if (nearestIndex !== liveTabIndex.current) {
          triggerHaptic();
          navigateToTab(nearestIndex);
        }
      },
    }),
  ).current;

  // ── Pill animated style (computed on UI thread — 60fps) ──
  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pillX.value },
      { scale: pillScale.value },
    ] as const,
  }));

  return (
    <View style={[styles.outerContainer, { bottom: bottomOffset }]}>
      <View style={styles.barWrapper}>
        {/* Animated pill indicator — can overflow when scaled */}
        <Animated.View
          style={[styles.pill, pillAnimatedStyle]}
          pointerEvents="none"
        >
          <AdaptiveGlassView intensity={45} glassEffectStyle="clear" style={[styles.pillBlur, { borderColor: theme.glass.borderStrong }]}>
            {!theme.isDark && <View style={[styles.pillOverlay, { backgroundColor: 'rgba(255, 255, 255, 0.55)' }]} />}
          </AdaptiveGlassView>
        </Animated.View>

        {/* Glass bar background */}
        <AdaptiveGlassView
          intensity={24}
          style={[styles.blurContainer, glassStyles.blurContentLarge, theme.glass.navWrapperStyle]}
        >
          {!theme.isDark && <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlay }]} pointerEvents="none" />}
        </AdaptiveGlassView>

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
                  color={isFocused ? theme.colors.primary : theme.colors.text.tertiary}
                />
                <Text
                  style={[styles.label, { color: isFocused ? theme.colors.primary : theme.colors.text.tertiary }]}
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
    ...StyleSheet.absoluteFillObject,
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
  },
  pillOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
