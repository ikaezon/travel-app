import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Drives opacity + scale animation for a dropdown menu that appears when visible becomes true.
 * Returns animated values to apply to the menu container.
 * Refs for opacity/scale are stable; only `visible` drives the effect.
 */
export function useMenuAnimation(visible: boolean) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      scale.setValue(0.96);
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
    }
  }, [visible, opacity, scale]);

  return { opacity, scale };
}
