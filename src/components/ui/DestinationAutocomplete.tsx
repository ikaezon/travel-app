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
import { MaterialIcons } from '@expo/vector-icons';
import { borderRadius, spacing, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';
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
  const theme = useTheme();
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
        style={({ pressed }) => [
          styles.suggestionRow,
          pressed && { backgroundColor: theme.colors.background },
        ]}
        onPress={() => handleSelect(item)}
      >
        <MaterialIcons name="location-on" size={18} color={theme.colors.text.secondary} />
        <Text style={[styles.suggestionText, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {item.formatted}
        </Text>
      </Pressable>
    ),
    [handleSelect, theme]
  );

  const inputContent = (
    <>
      <Text style={[
        styles.label,
        { color: variant === 'glass' ? theme.colors.text.primary : theme.colors.text.secondary },
      ]}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="location-on"
          size={20}
          color={theme.colors.text.secondary}
          style={styles.leftIcon}
        />
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            styles.inputWithLeftIcon,
            variant === 'glass' && { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)', borderColor: theme.glassColors.border },
            !variant && { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            { color: theme.colors.text.primary },
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={() => value.trim().length >= 2 && suggestions.length > 0 && setDropdownVisible(true)}
          onBlur={handleBlur}
        />
        {hasApi && loading && (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={styles.loader}
          />
        )}
      </View>
      {hasApi && dropdownVisible && suggestions.length > 0 && (
        <View style={[
          styles.dropdown,
          variant === 'glass' && { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)', borderColor: theme.glassColors.border },
          !variant && { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
        ]}>
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
        <View style={[styles.glassWrapper, !theme.isDark && { borderColor: theme.glassColors.border }, theme.isDark && { borderWidth: 0 }]}>
          <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.glassBlur, glassStyles.blurContent]}>
            <View style={[styles.glassOverlay, { backgroundColor: theme.isDark ? 'rgba(40, 40, 45, 0.35)' : theme.glassColors.overlayStrong }]} pointerEvents="none" />
            <View style={styles.glassContent}>{inputContent}</View>
          </AdaptiveGlassView>
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
  },
  glassContent: {
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontFamily: fontFamilies.regular,
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
    borderRadius: glassConstants.radius.card,
    borderWidth: 1,
    maxHeight: 240,
    overflow: 'hidden',
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
  suggestionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamilies.regular,
  },
});
