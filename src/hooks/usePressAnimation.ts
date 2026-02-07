import { useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';

const PRESS_SPRING = { tension: 280, friction: 14, useNativeDriver: true };
const RELEASE_SPRING = { tension: 200, friction: 18, useNativeDriver: true };
const DEFAULT_SCALE = 1.03;

/**
 * Returns press animation handlers and an optional entrance spring.
 *
 * @param scale – target scale when pressed (default 1.03)
 * @param entranceDelay – if >= 0, plays a 0.95→1 entrance spring with this delay
 */
export function usePressAnimation(scale = DEFAULT_SCALE, entranceDelay = -1) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const entranceAnim = useRef(new Animated.Value(entranceDelay >= 0 ? 0.95 : 1)).current;

  useEffect(() => {
    if (entranceDelay < 0) return;
    Animated.spring(entranceAnim, {
      toValue: 1,
      tension: 100,
      friction: 12,
      delay: entranceDelay,
      useNativeDriver: true,
    }).start();
  }, [entranceDelay, entranceAnim]);

  const onPressIn = useCallback(() => {
    Animated.spring(scaleAnim, { ...PRESS_SPRING, toValue: scale }).start();
  }, [scaleAnim, scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, { ...RELEASE_SPRING, toValue: 1 }).start();
  }, [scaleAnim]);

  const animatedScale = entranceDelay >= 0
    ? Animated.multiply(entranceAnim, scaleAnim)
    : scaleAnim;

  return { scaleAnim, entranceAnim, animatedScale, onPressIn, onPressOut } as const;
}
