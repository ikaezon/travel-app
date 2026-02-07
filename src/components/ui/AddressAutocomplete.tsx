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
  createAddressAutocompleteService,
  type AddressSuggestion,
} from '../../data/services/placeAutocompleteService';

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  style?: object;
  variant?: 'default' | 'glass';
}

export function AddressAutocomplete({
  label,
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder = 'Search for an address...',
  style,
  variant = 'default',
}: AddressAutocompleteProps) {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const hasApi = useMemo(() => isPlaceAutocompleteAvailable(), []);
  const lastQueryRef = useRef<string>('');
  const justSelectedRef = useRef<string | null>(null);
  const userHasTypedRef = useRef(false);
  const autocompleteApi = useRef(createAddressAutocompleteService()).current;

  useEffect(() => {
    // Only fetch suggestions if user is focused and has typed
    if (!hasApi || !isFocused || !userHasTypedRef.current || value.trim().length < 2) {
      setSuggestions([]);
      setDropdownVisible(false);
      setLoading(false);
      lastQueryRef.current = '';
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
  }, [value, hasApi, isFocused, autocompleteApi]);

  const handleChangeText = useCallback(
    (text: string) => {
      userHasTypedRef.current = true;
      onChangeText(text);
      if (!hasApi) return;
      if (text.trim().length < 2) {
        setSuggestions([]);
        setDropdownVisible(false);
      }
    },
    [onChangeText, hasApi]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    userHasTypedRef.current = false;
    setTimeout(() => setDropdownVisible(false), 200);
  }, []);

  const handleSelect = useCallback(
    (item: AddressSuggestion) => {
      const displayText = item.formatted;
      justSelectedRef.current = displayText;
      onChangeText(displayText);
      onSelectSuggestion?.(item);
    setSuggestions([]);
    setDropdownVisible(false);
    userHasTypedRef.current = false;
    Keyboard.dismiss();
  },
  [onChangeText, onSelectSuggestion]
);

  const renderSuggestion = useCallback(
    (item: AddressSuggestion) => (
      <Pressable
        key={item.placeId}
        style={({ pressed }) => [
          styles.suggestionRow,
          pressed && { backgroundColor: theme.colors.surface },
        ]}
        onPress={() => handleSelect(item)}
      >
        <MaterialIcons name="place" size={18} color={theme.colors.text.secondary} />
        <Text style={[styles.suggestionText, { color: theme.colors.text.primary }]} numberOfLines={2}>
          {item.formatted}
        </Text>
      </Pressable>
    ),
    [handleSelect]
  );

  const inputContent = (
    <>
      <Text style={[styles.label, { color: variant === 'glass' ? theme.colors.text.secondary : theme.colors.text.primary }]}>{label}</Text>
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
            variant === 'glass' && { borderColor: theme.glass.border },
            { color: theme.colors.text.primary, borderColor: theme.colors.border },
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={handleFocus}
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
          variant === 'glass' && { borderColor: theme.glass.border },
          { borderColor: theme.colors.border },
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
        <View style={[styles.glassWrapper, theme.glass.cardWrapperStyle]}>
          <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.glassBlur, glassStyles.blurContent]}>
            <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
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
    backgroundColor: 'transparent',
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
    maxHeight: 280,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  dropdownList: {
    maxHeight: 276,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    backgroundColor: 'transparent',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    lineHeight: 20,
  },
});
