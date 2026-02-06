import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Keyboard,
  LayoutChangeEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import airports from '@nwpr/airport-codes';
import {
  spacing,
  fontFamilies,
  glassStyles,
  borderRadius,
  glassConstants,
} from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface AirportAutocompleteProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectAirport?: (iata: string, airport: Airport) => void;
  placeholder?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  variant?: 'default' | 'glass';
}

// Pre-process airports for faster search
const airportList: Airport[] = airports
  .filter((a: any) => a.iata && a.iata.length === 3)
  .map((a: any) => ({
    iata: a.iata,
    name: a.name,
    city: a.city,
    country: a.country,
  }));

export function AirportAutocomplete({
  label,
  value,
  onChangeText,
  onSelectAirport,
  placeholder = 'Search airport...',
  iconName = 'flight',
  variant = 'default',
}: AirportAutocompleteProps) {
  const theme = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);
  const justSelectedRef = useRef<string | null>(null);

  // Search airports by IATA, city, or name
  const suggestions = useMemo(() => {
    if (!value.trim() || value.trim().length < 2) return [];
    if (justSelectedRef.current === value.trim()) return [];

    const query = value.toLowerCase().trim();
    const results: Airport[] = [];

    for (const airport of airportList) {
      if (airport.iata.toLowerCase() === query) {
        results.unshift(airport);
      } else if (
        airport.iata.toLowerCase().startsWith(query) ||
        airport.city.toLowerCase().includes(query) ||
        airport.name.toLowerCase().includes(query)
      ) {
        if (results.length < 5) {
          results.push(airport);
        }
      }
      if (results.length >= 5) break;
    }

    return results;
  }, [value]);

  const handleCardLayout = useCallback((e: LayoutChangeEvent) => {
    setCardHeight(e.nativeEvent.layout.height);
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      justSelectedRef.current = null;
      onChangeText(text);
      if (text.trim().length >= 2) {
        setDropdownVisible(true);
      } else {
        setDropdownVisible(false);
      }
    },
    [onChangeText]
  );

  const handleSelect = useCallback(
    (airport: Airport) => {
      justSelectedRef.current = airport.iata;
      onChangeText(airport.iata);
      onSelectAirport?.(airport.iata, airport);
      setDropdownVisible(false);
      Keyboard.dismiss();
    },
    [onChangeText, onSelectAirport]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => setDropdownVisible(false), 200);
  }, []);

  const handleFocus = useCallback(() => {
    if (value.trim().length >= 2 && suggestions.length > 0) {
      setDropdownVisible(true);
    }
  }, [value, suggestions.length]);

  const renderSuggestion = useCallback(
    (airport: Airport, isLast: boolean) => (
      <Pressable
        key={airport.iata}
        style={({ pressed }) => [
          styles.suggestionRow,
          pressed && { backgroundColor: theme.glassColors.menuItemPressed },
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.glassColors.menuItemBorder },
        ]}
        onPress={() => handleSelect(airport)}
      >
        <BlurView intensity={40} tint={theme.blurTint} style={[styles.iataTag, { borderColor: theme.glassColors.borderBlue, backgroundColor: theme.glassColors.overlayBlue }]}>
          <Text style={[styles.iataText, { color: theme.colors.text.primary }]}>{airport.iata}</Text>
        </BlurView>
        <View style={styles.suggestionInfo}>
          <Text style={[styles.cityText, { color: theme.colors.text.primary }]} numberOfLines={1}>
            {airport.city}
          </Text>
          <Text style={[styles.airportName, { color: theme.colors.text.secondary }]} numberOfLines={1}>
            {airport.name}
          </Text>
        </View>
        <MaterialIcons
          name="arrow-forward"
          size={16}
          color={theme.colors.text.tertiary}
        />
      </Pressable>
    ),
    [handleSelect, theme]
  );

  const showDropdown = dropdownVisible && suggestions.length > 0;

  const inputContent = (
    <>
      <Text style={[
        styles.label,
        { color: variant === 'glass' ? theme.colors.text.primary : theme.colors.text.secondary },
      ]}>
        {label}
      </Text>
      <View style={styles.inputContainer}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={20}
            color={theme.colors.text.secondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            iconName && styles.inputWithLeftIcon,
            variant === 'glass' && { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: theme.glassColors.border },
            !variant && { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            { color: theme.colors.text.primary },
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>
    </>
  );

  if (variant === 'glass') {
    return (
      <View style={styles.container}>
        <View style={styles.glassWrapper} onLayout={handleCardLayout}>
          <BlurView
            intensity={24}
            tint={theme.blurTint}
            style={[styles.glassBlur, glassStyles.blurContent]}
          >
            <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />
            <View style={styles.glassContent}>{inputContent}</View>
          </BlurView>
        </View>

        {/* Glass dropdown */}
        {showDropdown && (
          <View style={[styles.dropdownContainer, { top: cardHeight + 8, borderColor: theme.glassColors.borderStrong, boxShadow: theme.glassShadows.elevated }]}>
            <BlurView intensity={48} tint={theme.blurTint} style={styles.dropdownBlur}>
              <View style={[styles.dropdownOverlay, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} pointerEvents="none" />
              <ScrollView
                style={styles.dropdownList}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {suggestions.map((a, i) =>
                  renderSuggestion(a, i === suggestions.length - 1)
                )}
              </ScrollView>
            </BlurView>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleCardLayout}>
      {inputContent}
      {showDropdown && (
        <View style={[styles.dropdownContainerDefault, { top: cardHeight + 4, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <ScrollView
            style={styles.dropdownList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {suggestions.map((a, i) =>
              renderSuggestion(a, i === suggestions.length - 1)
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  glassWrapper: {
    ...glassStyles.cardWrapper,
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
  // Glass dropdown
  dropdownContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    zIndex: 200,
  },
  dropdownBlur: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  // Default dropdown
  dropdownContainerDefault: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    maxHeight: 280,
    overflow: 'hidden',
    zIndex: 200,
  },
  dropdownList: {
    maxHeight: 280,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iataTag: {
    ...glassStyles.pillContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iataText: {
    fontSize: 13,
    fontFamily: fontFamilies.bold,
    letterSpacing: 0.5,
  },
  suggestionInfo: {
    flex: 1,
  },
  cityText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
  },
  airportName: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    marginTop: 2,
  },
});
