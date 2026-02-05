import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Drives opacity + scale animation for a dropdown menu that appears when visible becomes true.
 * Returns animated values to apply to the menu container.
 *
 * Flash fix: Never call setValue(0) when opening. StrictMode remounts components, resetting
 * refs, so a ref guard can't prevent a second effect run from resetting opacity mid-animation.
 * Instead: reset values only when closing; when opening, just start the animation from current
 * values (already 0/0.96 from init or previous close).
 */
export function useMenuAnimation(visible: boolean) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const hasAnimatedForCurrentVisibility = useRef(false);

  useEffect(() => {
    if (visible) {
      if (!hasAnimatedForCurrentVisibility.current) {
        hasAnimatedForCurrentVisibility.current = true;
        // Wait for one frame to allow layout to settle before starting animation.
        // This fixes the "blur gap" issue where BlurView renders too small initially.
        requestAnimationFrame(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              damping: 14,
              stiffness: 200,
            }),
          ]).start();
        });
      }
    } else {
      hasAnimatedForCurrentVisibility.current = false;
      // Reset values when closing so next open starts from correct position
      opacity.setValue(0);
      scale.setValue(0.96);
    }
  }, [visible, opacity, scale]);

  return { opacity, scale };
}
