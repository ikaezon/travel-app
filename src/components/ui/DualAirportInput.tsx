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

interface DualAirportInputProps {
  departureValue: string;
  arrivalValue: string;
  onDepartureChange: (text: string) => void;
  onArrivalChange: (text: string) => void;
  onDepartureSelect?: (iata: string, airport: Airport) => void;
  onArrivalSelect?: (iata: string, airport: Airport) => void;
  departurePlaceholder?: string;
  arrivalPlaceholder?: string;
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

function searchAirports(query: string): Airport[] {
  if (!query.trim() || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const results: Airport[] = [];

  for (const airport of airportList) {
    if (airport.iata.toLowerCase() === q) {
      results.unshift(airport);
    } else if (
      airport.iata.toLowerCase().startsWith(q) ||
      airport.city.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q)
    ) {
      if (results.length < 5) {
        results.push(airport);
      }
    }
    if (results.length >= 5) break;
  }

  return results;
}

export function DualAirportInput({
  departureValue,
  arrivalValue,
  onDepartureChange,
  onArrivalChange,
  onDepartureSelect,
  onArrivalSelect,
  departurePlaceholder = 'SFO',
  arrivalPlaceholder = 'JFK',
}: DualAirportInputProps) {
  const [activeField, setActiveField] = useState<'departure' | 'arrival' | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const justSelectedDep = useRef<string | null>(null);
  const justSelectedArr = useRef<string | null>(null);

  // Suggestions based on active field
  const departureSuggestions = useMemo(() => {
    if (justSelectedDep.current === departureValue.trim()) return [];
    return searchAirports(departureValue);
  }, [departureValue]);

  const arrivalSuggestions = useMemo(() => {
    if (justSelectedArr.current === arrivalValue.trim()) return [];
    return searchAirports(arrivalValue);
  }, [arrivalValue]);

  const handleCardLayout = useCallback((e: LayoutChangeEvent) => {
    setCardHeight(e.nativeEvent.layout.height);
  }, []);

  const handleDepartureChange = useCallback(
    (text: string) => {
      justSelectedDep.current = null;
      onDepartureChange(text);
      setActiveField('departure');
    },
    [onDepartureChange]
  );

  const handleArrivalChange = useCallback(
    (text: string) => {
      justSelectedArr.current = null;
      onArrivalChange(text);
      setActiveField('arrival');
    },
    [onArrivalChange]
  );

  const handleDepartureSelect = useCallback(
    (airport: Airport) => {
      justSelectedDep.current = airport.iata;
      onDepartureChange(airport.iata);
      onDepartureSelect?.(airport.iata, airport);
      setActiveField(null);
      Keyboard.dismiss();
    },
    [onDepartureChange, onDepartureSelect]
  );

  const handleArrivalSelect = useCallback(
    (airport: Airport) => {
      justSelectedArr.current = airport.iata;
      onArrivalChange(airport.iata);
      onArrivalSelect?.(airport.iata, airport);
      setActiveField(null);
      Keyboard.dismiss();
    },
    [onArrivalChange, onArrivalSelect]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => setActiveField(null), 200);
  }, []);

  const renderSuggestion = useCallback(
    (airport: Airport, onSelect: (a: Airport) => void, isLast: boolean) => (
      <Pressable
        key={airport.iata}
        style={({ pressed }) => [
          styles.suggestionRow,
          pressed && styles.suggestionRowPressed,
          !isLast && styles.suggestionBorder,
        ]}
        onPress={() => onSelect(airport)}
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
    []
  );

  const showDepartureSuggestions = activeField === 'departure' && departureSuggestions.length > 0;
  const showArrivalSuggestions = activeField === 'arrival' && arrivalSuggestions.length > 0;

  return (
    <View style={styles.container}>
      {/* Main card */}
      <View style={styles.glassWrapper} onLayout={handleCardLayout}>
        <BlurView
          intensity={24}
          tint="light"
          style={[styles.glassBlur, glassStyles.blurContent]}
        >
          <View style={styles.glassOverlay} pointerEvents="none" />
          <View style={styles.glassContent}>
            {/* Labels row */}
            <View style={styles.labelsRow}>
              <Text style={styles.label}>From</Text>
              <View style={styles.labelSpacer} />
              <Text style={styles.label}>To</Text>
            </View>

            {/* Inputs row */}
            <View style={styles.inputsRow}>
              {/* Departure input */}
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="flight-takeoff"
                  size={18}
                  color={colors.text.secondary.light}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={departureValue}
                  onChangeText={handleDepartureChange}
                  placeholder={departurePlaceholder}
                  placeholderTextColor={colors.text.tertiary.light}
                  onFocus={() => setActiveField('departure')}
                  onBlur={handleBlur}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>

              {/* Separator icon */}
              <View style={styles.separatorContainer}>
                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color={colors.text.secondary.light}
                />
              </View>

              {/* Arrival input */}
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="flight-land"
                  size={18}
                  color={colors.text.secondary.light}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={arrivalValue}
                  onChangeText={handleArrivalChange}
                  placeholder={arrivalPlaceholder}
                  placeholderTextColor={colors.text.tertiary.light}
                  onFocus={() => setActiveField('arrival')}
                  onBlur={handleBlur}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Dropdown - positioned outside the card */}
      {(showDepartureSuggestions || showArrivalSuggestions) && (
        <View
          style={[
            styles.dropdownContainer,
            { top: cardHeight + 8 },
            showArrivalSuggestions && styles.dropdownRight,
          ]}
        >
          <BlurView
            intensity={48}
            tint="light"
            style={styles.dropdownBlur}
          >
            <View style={styles.dropdownOverlay} pointerEvents="none" />
            <ScrollView
              style={styles.dropdownList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {showDepartureSuggestions &&
                departureSuggestions.map((a, i) =>
                  renderSuggestion(a, handleDepartureSelect, i === departureSuggestions.length - 1)
                )}
              {showArrivalSuggestions &&
                arrivalSuggestions.map((a, i) =>
                  renderSuggestion(a, handleArrivalSelect, i === arrivalSuggestions.length - 1)
                )}
            </ScrollView>
          </BlurView>
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
  labelsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.primary.light,
  },
  labelSpacer: {
    width: 32,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: glassColors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingLeft: 40,
    paddingRight: spacing.md,
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.text.primary.light,
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    top: 15,
    zIndex: 1,
  },
  separatorContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Dropdown styles - glass effect
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
  dropdownRight: {
    // Alignment hint for arrival (visual only, dropdown is full width)
  },
  dropdownBlur: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
