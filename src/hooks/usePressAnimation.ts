import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

// Spring configs matching the bottom tab bar bubble feel
const PRESS_SPRING = { tension: 280, friction: 14, useNativeDriver: true };
const RELEASE_SPRING = { tension: 200, friction: 18, useNativeDriver: true };

/** Default scale for larger elements (cards, buttons) */
const DEFAULT_SCALE = 1.03;

/**
 * Returns an Animated.Value for scale and press-in / press-out handlers
 * that apply a spring scale-up animation on press.
 *
 * @param scale – target scale when pressed (default 1.03)
 */
export function usePressAnimation(scale = DEFAULT_SCALE) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scaleAnim, { ...PRESS_SPRING, toValue: scale }).start();
  }, [scaleAnim, scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, { ...RELEASE_SPRING, toValue: 1 }).start();
  }, [scaleAnim]);

  return { scaleAnim, onPressIn, onPressOut } as const;
}
