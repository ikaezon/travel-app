import React from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { colors } from '../../theme';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
}: ToggleSwitchProps) {
  const translateX = React.useRef(new Animated.Value(value ? 20 : 0)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 20 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [value, translateX]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable
      style={[
        styles.track,
        value ? styles.trackActive : styles.trackInactive,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.thumb,
          value ? styles.thumbActive : styles.thumbInactive,
          { transform: [{ translateX }] },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  trackInactive: {
    backgroundColor: colors.border.light,
  },
  trackActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.3)',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbInactive: {
    backgroundColor: colors.white,
  },
  thumbActive: {
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
