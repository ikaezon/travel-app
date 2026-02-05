import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontFamilies, glassStyles, glassColors } from '../../theme';
import { TAB_CONFIG } from '../../constants';

// Smoother spring - less bouncy, more fluid
const SPRING_CONFIG = {
  tension: 170,
  friction: 26,
  useNativeDriver: true, // Runs on UI thread for 60fps
};

const PILL_WIDTH = 75;
const PILL_HEIGHT = 52;
const PILL_PADDING = 6;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, spacing.lg);

  // Track tab center positions (relative to tabBar)
  const tabCenters = useRef<number[]>([]);
  const isInitialized = useRef(false);

  // Animated value for pill translateX
  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);
  const startIndex = useRef(state.index);
  const currentTranslateX = useRef(0);

  // Track current value for pan gesture calculations
  useEffect(() => {
    const id = pillTranslateX.addListener(({ value }) => {
      currentTranslateX.current = value;
    });
    return () => pillTranslateX.removeListener(id);
  }, [pillTranslateX]);

  // Get translateX for a tab (pill left edge position)
  const getTranslateXForTab = useCallback((index: number): number | undefined => {
    const centerX = tabCenters.current[index];
    if (centerX === undefined) return undefined;
    return centerX - PILL_WIDTH / 2;
  }, []);

  // Animate pill to a specific tab
  const animatePillToTab = useCallback(
    (index: number, animate = true) => {
      const translateX = getTranslateXForTab(index);
      if (translateX === undefined) return;

      if (animate) {
        Animated.spring(pillTranslateX, {
          ...SPRING_CONFIG,
          toValue: translateX,
        }).start();
      } else {
        pillTranslateX.setValue(translateX);
      }
    },
    [pillTranslateX, getTranslateXForTab]
  );

  // Find nearest tab based on center X position
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

  // Navigate to tab
  const navigateToTab = useCallback(
    (index: number) => {
      const route = state.routes[index];
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (state.index !== index && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [navigation, state.routes, state.index]
  );

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        startIndex.current = state.index;
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
          Math.min(lastTranslateX, targetTranslateX)
        );
        pillTranslateX.setValue(clampedTranslateX);
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false;

        // Calculate current pill center from translateX
        const currentPillCenter = currentTranslateX.current + PILL_WIDTH / 2;
        const nearestIndex = findNearestTab(currentPillCenter);

        // Animate to nearest tab
        animatePillToTab(nearestIndex, true);

        // Navigate if different
        if (nearestIndex !== state.index) {
          navigateToTab(nearestIndex);
        }
      },
    })
  ).current;

  // Handle tab layout measurements
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
    [state.index, state.routes.length, animatePillToTab]
  );

  // Update pill when state.index changes (from external navigation)
  useEffect(() => {
    if (!isDragging.current && isInitialized.current) {
      animatePillToTab(state.index, true);
    }
  }, [state.index, animatePillToTab]);

  // Handle tab press
  const handleTabPress = useCallback(
    (index: number) => {
      animatePillToTab(index, true);
      navigateToTab(index);
    },
    [animatePillToTab, navigateToTab]
  );

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <BlurView
        intensity={24}
        tint="light"
        style={[styles.blurContainer, glassStyles.blurContentLarge]}
      >
        <View style={styles.glassOverlay} pointerEvents="none" />

        <View style={styles.tabBar} {...panResponder.panHandlers}>
          {/* Animated pill indicator */}
          <Animated.View
            style={[
              styles.pill,
              {
                transform: [{ translateX: pillTranslateX }],
              },
            ]}
          >
            <BlurView intensity={40} tint="light" style={styles.pillBlur}>
              <View style={styles.pillOverlay} />
            </BlurView>
          </Animated.View>

          {/* Tab items */}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name] || { icon: 'home', label: route.name };

            return (
              <Pressable
                key={route.key}
                style={styles.tabItem}
                onLayout={(e) => handleTabLayout(index, e)}
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
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  blurContainer: {
    ...glassStyles.navBarWrapper,
    width: '90%',
    maxWidth: 340,
    position: 'relative',
    height: 64,
    justifyContent: 'center',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: PILL_PADDING,
    height: PILL_HEIGHT + PILL_PADDING * 2,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
    zIndex: 2,
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
    borderRadius: PILL_WIDTH / 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  pillBlur: {
    flex: 1,
    borderRadius: PILL_WIDTH / 2,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: glassColors.borderStrong,
  },
  pillOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});
