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
import { MaterialIcons } from '@expo/vector-icons';
import airports from '@nwpr/airport-codes';
import {
  spacing,
  fontFamilies,
  glassStyles,
  glassConstants,
  borderRadius,
} from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';
import { useKeyboardScroll } from './KeyboardAwareScrollView';

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
  const theme = useTheme();
  const { scrollToInput } = useKeyboardScroll();
  const containerRef = useRef<View>(null);
  const [activeField, setActiveField] = useState<'departure' | 'arrival' | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const justSelectedDep = useRef<string | null>(null);
  const justSelectedArr = useRef<string | null>(null);

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
          pressed && { backgroundColor: theme.glass.menuItemPressed },
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.glass.menuItemBorder },
        ]}
        onPress={() => onSelect(airport)}
      >
        <AdaptiveGlassView 
          intensity={40} 
          darkIntensity={10}
          glassEffectStyle="clear"
          style={[
            styles.iataTag,
            { borderColor: theme.glass.borderBlue, backgroundColor: theme.glass.overlayBlue }
          ]}
        >
          <Text style={[styles.iataText, { color: theme.colors.text.primary }]}>{airport.iata}</Text>
        </AdaptiveGlassView>
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
    [theme]
  );

  const showDepartureSuggestions = activeField === 'departure' && departureSuggestions.length > 0;
  const showArrivalSuggestions = activeField === 'arrival' && arrivalSuggestions.length > 0;

  return (
    <View style={styles.container}>
      <View ref={containerRef} style={[glassStyles.formWrapper, theme.glass.cardWrapperStyle]} onLayout={handleCardLayout}>
        <AdaptiveGlassView
          intensity={24}
          darkIntensity={10}
          glassEffectStyle="clear"
          style={[glassStyles.formBlur, glassStyles.blurContent]}
        >
          <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
          <View style={glassStyles.formContent}>
            <View style={styles.labelsRow}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>From</Text>
              <View style={styles.labelSpacer} />
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>To</Text>
            </View>

            <View style={styles.inputsRow}>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="flight-takeoff"
                  size={18}
                  color={theme.colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { borderColor: theme.glass.border, backgroundColor: theme.glass.fill, color: theme.colors.text.primary }]}
                  value={departureValue}
                  onChangeText={handleDepartureChange}
                  placeholder={departurePlaceholder}
                  placeholderTextColor={theme.colors.text.tertiary}
                  onFocus={() => { setActiveField('departure'); scrollToInput(containerRef); }}
                  onBlur={handleBlur}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.separatorContainer}>
                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </View>

              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="flight-land"
                  size={18}
                  color={theme.colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { borderColor: theme.glass.border, backgroundColor: theme.glass.fill, color: theme.colors.text.primary }]}
                  value={arrivalValue}
                  onChangeText={handleArrivalChange}
                  placeholder={arrivalPlaceholder}
                  placeholderTextColor={theme.colors.text.tertiary}
                  onFocus={() => { setActiveField('arrival'); scrollToInput(containerRef); }}
                  onBlur={handleBlur}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>
        </AdaptiveGlassView>
      </View>

      {(showDepartureSuggestions || showArrivalSuggestions) && (
        <View
          style={[
            styles.dropdownContainer,
            { top: cardHeight + 8, borderColor: theme.glass.borderStrong },
          ]}
        >
          <AdaptiveGlassView
            intensity={48}
            darkIntensity={10}
            glassEffectStyle="clear"
            style={styles.dropdownBlur}
          >
            <View style={[styles.dropdownOverlay, { backgroundColor: theme.glass.overlay }]} pointerEvents="none" />
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
          </AdaptiveGlassView>
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
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  labelsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamilies.medium,
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
    paddingLeft: 40,
    paddingRight: spacing.md,
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
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
  dropdownContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
    borderWidth: 1.5,
    zIndex: 200,
  },
  dropdownBlur: {
    borderRadius: glassConstants.radius.card,
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
