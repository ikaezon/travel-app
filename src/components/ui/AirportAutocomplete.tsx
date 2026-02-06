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
  colors,
  spacing,
  fontFamilies,
  glassStyles,
  glassColors,
  borderRadius,
  glassShadows,
} from '../../theme';

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
          pressed && styles.suggestionRowPressed,
          !isLast && styles.suggestionBorder,
        ]}
        onPress={() => handleSelect(airport)}
      >
        <BlurView intensity={40} tint="light" style={styles.iataTag}>
          <Text style={styles.iataText}>{airport.iata}</Text>
        </BlurView>
        <View style={styles.suggestionInfo}>
          <Text style={styles.cityText} numberOfLines={1}>
            {airport.city}
          </Text>
          <Text style={styles.airportName} numberOfLines={1}>
            {airport.name}
          </Text>
        </View>
        <MaterialIcons
          name="arrow-forward"
          size={16}
          color={colors.text.tertiary.light}
        />
      </Pressable>
    ),
    [handleSelect]
  );

  const showDropdown = dropdownVisible && suggestions.length > 0;

  const inputContent = (
    <>
      <Text style={[styles.label, variant === 'glass' && styles.labelGlass]}>
        {label}
      </Text>
      <View style={styles.inputContainer}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={20}
            color={colors.text.secondary.light}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            iconName && styles.inputWithLeftIcon,
            variant === 'glass' && styles.inputGlass,
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary.light}
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
            tint="light"
            style={[styles.glassBlur, glassStyles.blurContent]}
          >
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.glassContent}>{inputContent}</View>
          </BlurView>
        </View>

        {/* Glass dropdown */}
        {showDropdown && (
          <View style={[styles.dropdownContainer, { top: cardHeight + 8 }]}>
            <BlurView intensity={48} tint="light" style={styles.dropdownBlur}>
              <View style={styles.dropdownOverlay} pointerEvents="none" />
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
        <View style={[styles.dropdownContainerDefault, { top: cardHeight + 4 }]}>
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
  // Glass dropdown
  dropdownContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: glassColors.borderStrong,
    boxShadow: glassShadows.elevated,
    zIndex: 200,
  },
  dropdownBlur: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  // Default dropdown
  dropdownContainerDefault: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.light,
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
  suggestionRowPressed: {
    backgroundColor: glassColors.menuItemPressed,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glassColors.menuItemBorder,
  },
  iataTag: {
    ...glassStyles.pillContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderColor: glassColors.borderBlue,
    backgroundColor: glassColors.overlayBlue,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iataText: {
    fontSize: 13,
    fontFamily: fontFamilies.bold,
    color: colors.text.primary.light,
    letterSpacing: 0.5,
  },
  suggestionInfo: {
    flex: 1,
  },
  cityText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  airportName: {
    fontSize: 12,
    fontFamily: fontFamilies.regular,
    color: colors.text.secondary.light,
    marginTop: 2,
  },
});
