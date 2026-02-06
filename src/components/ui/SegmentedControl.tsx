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

// Smooth spring config
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
  // Track segment layouts
  const segmentLayouts = useRef<{ x: number; width: number; center: number }[]>([]);
  const isInitialized = useRef(false);

  // Get current selected index
  const selectedIndex = options.findIndex((opt) => opt.value === selectedValue);

  // Animated value for pill translateX (position of left edge)
  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);
  const startIndex = useRef(selectedIndex);
  const currentTranslateX = useRef(0);

  // Track current value for pan calculations
  useEffect(() => {
    const id = pillTranslateX.addListener(({ value }) => {
      currentTranslateX.current = value;
    });
    return () => pillTranslateX.removeListener(id);
  }, [pillTranslateX]);

  // Animate pill to a specific segment
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

  // Find nearest segment based on X position
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

  // Select a segment
  const selectSegment = useCallback(
    (index: number) => {
      const option = options[index];
      if (option && option.value !== selectedValue) {
        onValueChange(option.value);
      }
    },
    [options, selectedValue, onValueChange]
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
        startIndex.current = selectedIndex;
      },
      onPanResponderMove: (_, gestureState) => {
        const startLayout = segmentLayouts.current[startIndex.current];
        if (!startLayout) return;

        const targetX = startLayout.x + gestureState.dx;

        // Clamp to valid range
        const firstLayout = segmentLayouts.current[0];
        const lastLayout = segmentLayouts.current[segmentLayouts.current.length - 1];
        if (!firstLayout || !lastLayout) return;

        const clampedX = Math.max(firstLayout.x, Math.min(lastLayout.x, targetX));
        pillTranslateX.setValue(clampedX);
      },
      onPanResponderRelease: () => {
        isDragging.current = false;

        // Find nearest based on current position + half width to get center
        const startLayout = segmentLayouts.current[startIndex.current];
        if (!startLayout) return;

        const currentCenter = currentTranslateX.current + startLayout.width / 2;
        const nearestIndex = findNearestSegment(currentCenter);

        // Animate to nearest segment
        animatePillToSegment(nearestIndex, true);

        // Update selection if different
        if (nearestIndex !== selectedIndex) {
          selectSegment(nearestIndex);
        }
      },
    })
  ).current;

  // Handle segment layout measurements
  const handleSegmentLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      segmentLayouts.current[index] = { x, width, center: x + width / 2 };

      // Initialize pill position once all segments are measured
      if (index === options.length - 1 && !isInitialized.current) {
        isInitialized.current = true;
        animatePillToSegment(selectedIndex, false);
      }
    },
    [selectedIndex, options.length, animatePillToSegment]
  );

  // Update pill when selectedValue changes externally
  useEffect(() => {
    if (!isDragging.current && isInitialized.current && selectedIndex >= 0) {
      animatePillToSegment(selectedIndex, true);
    }
  }, [selectedIndex, animatePillToSegment]);

  // Handle segment press
  const handleSegmentPress = useCallback(
    (index: number) => {
      animatePillToSegment(index, true);
      selectSegment(index);
    },
    [animatePillToSegment, selectSegment]
  );

  // Calculate pill width based on number of options (equal width segments)
  const segmentWidthPercent = 100 / options.length;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Animated pill indicator */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 3,
            top: 3,
            height: 30,
            borderRadius: glassConstants.radius.icon,
            backgroundColor: theme.glassColors.borderStrong,
            boxShadow: theme.glassShadows.icon,
            zIndex: 1,
          },
          {
            width: `${segmentWidthPercent}%`,
            transform: [{ translateX: pillTranslateX }],
          },
        ]}
      />

      {/* Segment items */}
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
