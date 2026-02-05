import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontFamilies, glassColors, glassShadows, glassConstants } from '../../theme';

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
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, isSelected && styles.segmentSelected]}
            onPress={() => onValueChange(option.value)}
            accessibilityRole="button"
            accessibilityState={isSelected ? { selected: true } : {}}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
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
    borderRadius: glassConstants.radius.card,
    padding: 3,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  segmentSelected: {
    backgroundColor: glassColors.borderStrong,
    boxShadow: glassShadows.icon,
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: colors.text.tertiary.light,
  },
  labelSelected: {
    color: colors.primary,
    fontFamily: fontFamilies.semibold,
  },
});
