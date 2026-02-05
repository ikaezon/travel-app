import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, fontFamilies, glassStyles, glassColors } from '../../theme';
import {
  isPlaceAutocompleteAvailable,
  createPlaceAutocompleteService,
  type PlaceSuggestion,
} from '../../data/services/placeAutocompleteService';

interface DestinationAutocompleteProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion?: (displayText: string) => void;
  placeholder?: string;
  style?: object;
  /** Use liquid glass card styling */
  variant?: 'default' | 'glass';
}

export function DestinationAutocomplete({
  label,
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder = 'e.g. Paris, Tokyo',
  style,
  variant = 'default',
}: DestinationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const hasApi = useMemo(() => isPlaceAutocompleteAvailable(), []);
  const lastQueryRef = useRef<string>('');
  const justSelectedRef = useRef<string | null>(null);
  const autocompleteApi = useRef(createPlaceAutocompleteService()).current;

  useEffect(() => {
    if (!hasApi || value.trim().length < 2) {
      setSuggestions([]);
      setDropdownVisible(false);
      setLoading(false);
      lastQueryRef.current = '';
      justSelectedRef.current = null;
      return;
    }
    if (justSelectedRef.current === value.trim()) {
      justSelectedRef.current = null;
      setSuggestions([]);
      setDropdownVisible(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const query = value.trim();
    lastQueryRef.current = query;
    autocompleteApi.debouncedFetchSuggestions(value, (result) => {
      if (lastQueryRef.current !== query) return;
      setSuggestions(result);
      setLoading(false);
      setDropdownVisible(result.length > 0);
    });
    return () => autocompleteApi.cancel();
  }, [value, hasApi]);

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText(text);
      if (!hasApi) return;
      if (text.trim().length < 2) {
        setSuggestions([]);
        setDropdownVisible(false);
      }
    },
    [onChangeText, hasApi]
  );

  const handleSelect = useCallback(
    (item: PlaceSuggestion) => {
      const displayText = item.formatted;
      justSelectedRef.current = displayText;
      onChangeText(displayText);
      onSelectSuggestion?.(displayText);
      setSuggestions([]);
      setDropdownVisible(false);
      Keyboard.dismiss();
    },
    [onChangeText, onSelectSuggestion]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => setDropdownVisible(false), 200);
  }, []);

  const renderSuggestion = useCallback(
    (item: PlaceSuggestion) => (
      <Pressable
        key={item.formatted}
        style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionRowPressed]}
        onPress={() => handleSelect(item)}
      >
        <MaterialIcons name="location-on" size={18} color={colors.text.secondary.light} />
        <Text style={styles.suggestionText} numberOfLines={1}>
          {item.formatted}
        </Text>
      </Pressable>
    ),
    [handleSelect]
  );

  const inputContent = (
    <>
      <Text style={[styles.label, variant === 'glass' && styles.labelGlass]}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="location-on"
          size={20}
          color={colors.text.secondary.light}
          style={styles.leftIcon}
        />
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            styles.inputWithLeftIcon,
            variant === 'glass' && styles.inputGlass,
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary.light}
          onFocus={() => value.trim().length >= 2 && suggestions.length > 0 && setDropdownVisible(true)}
          onBlur={handleBlur}
        />
        {hasApi && loading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loader}
          />
        )}
      </View>
      {hasApi && dropdownVisible && suggestions.length > 0 && (
        <View style={[styles.dropdown, variant === 'glass' && styles.dropdownGlass]}>
          <ScrollView
            style={styles.dropdownList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            scrollEnabled={suggestions.length > 3}
          >
            {suggestions.map(renderSuggestion)}
          </ScrollView>
        </View>
      )}
    </>
  );

  if (variant === 'glass') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.glassWrapper}>
          <BlurView intensity={24} tint="light" style={[styles.glassBlur, glassStyles.blurContent]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.glassContent}>{inputContent}</View>
          </BlurView>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {inputContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  glassWrapper: {
    ...glassStyles.cardWrapper,
    overflow: 'hidden',
    width: '100%',
  },
  glassBlur: {
    padding: 12,
    position: 'relative',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
    backgroundColor: glassColors.overlayStrong,
  },
  glassContent: {
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary.light,
    marginBottom: spacing.sm,
  },
  labelGlass: {
    color: colors.text.primary.light,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.light,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontFamily: fontFamilies.regular,
    color: colors.text.primary.light,
  },
  inputGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: glassColors.border,
  },
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  leftIcon: {
    position: 'absolute',
    left: spacing.lg,
    top: 18,
    zIndex: 1,
  },
  loader: {
    position: 'absolute',
    right: spacing.lg,
    top: 18,
  },
  dropdown: {
    marginTop: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.light,
    maxHeight: 240,
    overflow: 'hidden',
  },
  dropdownGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: glassColors.border,
  },
  dropdownList: {
    maxHeight: 236,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  suggestionRowPressed: {
    backgroundColor: colors.background.light,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    color: colors.text.primary.light,
  },
});
