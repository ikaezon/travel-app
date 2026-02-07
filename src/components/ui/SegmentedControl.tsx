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
import { fontFamilies, glassConstants } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const SPRING_CONFIG = {
  tension: 170,
  friction: 26,
  useNativeDriver: true,
};

interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: ReadonlyArray<SegmentedControlOption>;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export function SegmentedControl({
  options,
  selectedValue,
  onValueChange,
}: SegmentedControlProps) {
  const theme = useTheme();
  const segmentLayouts = useRef<{ x: number; width: number; center: number }[]>([]);
  const isInitialized = useRef(false);
  const selectedIndex = options.findIndex((opt) => opt.value === selectedValue);
  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);
  const startIndex = useRef(selectedIndex);
  const currentTranslateX = useRef(0);

  useEffect(() => {
    const id = pillTranslateX.addListener(({ value }) => {
      currentTranslateX.current = value;
    });
    return () => pillTranslateX.removeListener(id);
  }, [pillTranslateX]);

  const animatePillToSegment = useCallback(
    (index: number, animate = true) => {
      const layout = segmentLayouts.current[index];
      if (!layout) return;

      const targetX = layout.x;

      if (animate) {
        Animated.spring(pillTranslateX, {
          ...SPRING_CONFIG,
          toValue: targetX,
        }).start();
      } else {
        pillTranslateX.setValue(targetX);
      }
    },
    [pillTranslateX]
  );

  const findNearestSegment = useCallback((x: number): number => {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    segmentLayouts.current.forEach((layout, index) => {
      const distance = Math.abs(x - layout.center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }, []);

  const selectSegment = useCallback(
    (index: number) => {
      const option = options[index];
      if (option && option.value !== selectedValue) {
        onValueChange(option.value);
      }
    },
    [options, selectedValue, onValueChange]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        startIndex.current = selectedIndex;
      },
      onPanResponderMove: (_, gestureState) => {
        const startLayout = segmentLayouts.current[startIndex.current];
        if (!startLayout) return;

        const targetX = startLayout.x + gestureState.dx;
        const firstLayout = segmentLayouts.current[0];
        const lastLayout = segmentLayouts.current[segmentLayouts.current.length - 1];
        if (!firstLayout || !lastLayout) return;

        const clampedX = Math.max(firstLayout.x, Math.min(lastLayout.x, targetX));
        pillTranslateX.setValue(clampedX);
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        const startLayout = segmentLayouts.current[startIndex.current];
        if (!startLayout) return;

        const currentCenter = currentTranslateX.current + startLayout.width / 2;
        const nearestIndex = findNearestSegment(currentCenter);
        animatePillToSegment(nearestIndex, true);
        if (nearestIndex !== selectedIndex) {
          selectSegment(nearestIndex);
        }
      },
    })
  ).current;

  const handleSegmentLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      segmentLayouts.current[index] = { x, width, center: x + width / 2 };
      if (index === options.length - 1 && !isInitialized.current) {
        isInitialized.current = true;
        animatePillToSegment(selectedIndex, false);
      }
    },
    [selectedIndex, options.length, animatePillToSegment]
  );

  useEffect(() => {
    if (!isDragging.current && isInitialized.current && selectedIndex >= 0) {
      animatePillToSegment(selectedIndex, true);
    }
  }, [selectedIndex, animatePillToSegment]);

  const handleSegmentPress = useCallback(
    (index: number) => {
      animatePillToSegment(index, true);
      selectSegment(index);
    },
    [animatePillToSegment, selectSegment]
  );

  const segmentWidthPercent = 100 / options.length;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 3,
            top: 3,
            height: 30,
            borderRadius: glassConstants.radius.icon,
            backgroundColor: theme.glass.borderStrong,
            boxShadow: theme.glass.cardBoxShadow,
            zIndex: 1,
          },
          {
            width: `${segmentWidthPercent}%`,
            transform: [{ translateX: pillTranslateX }],
          },
        ]}
      />
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;

        return (
          <Pressable
            key={option.value}
            style={styles.segment}
            onLayout={(e) => handleSegmentLayout(index, e)}
            onPress={() => handleSegmentPress(index)}
            accessibilityRole="button"
            accessibilityState={isSelected ? { selected: true } : {}}
            accessibilityLabel={option.label}
          >
            <Text style={[
              {
                fontSize: 12,
                fontFamily: fontFamilies.semibold,
                color: theme.colors.text.tertiary,
              },
              isSelected && {
                color: theme.colors.primary,
                fontFamily: fontFamilies.semibold,
              },
            ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 36,
    backgroundColor: 'transparent',
    borderRadius: glassConstants.radius.icon,
    padding: 3,
    position: 'relative',
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 2,
  },
});
