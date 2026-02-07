import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { spacing, borderRadius, shadows, fontFamilies, glassStyles, glassConstants } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';
import { parseToCalendarDate, formatCalendarDateToLongDisplay } from '../../utils/dateFormat';

const POPUP_FADE_DURATION = 150;
const POPUP_WIDTH = 320;
const POPUP_HEIGHT_ESTIMATE = 340;
const POPUP_TOP_OFFSET = 50;
const SCROLL_DELAY_MS = 150;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FADE_CONFIG = {
  duration: POPUP_FADE_DURATION,
  useNativeDriver: true as const,
};


export interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (formattedDate: string) => void;
  placeholder?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
  onOpen?: () => void;
  onClose?: () => void;
  bottomPadding?: number;
  variant?: 'default' | 'glass';
}

type InputLayout = { x: number; y: number; width: number; height: number };

function getPopupPosition(layout: InputLayout, bottomPadding: number) {
  const left = Math.max(
    spacing.sm,
    Math.min(layout.x + layout.width / 2 - POPUP_WIDTH / 2, SCREEN_WIDTH - POPUP_WIDTH - spacing.sm)
  );
  const preferredTop = layout.y + layout.height + spacing.sm + POPUP_TOP_OFFSET;
  const maxTop = SCREEN_HEIGHT - POPUP_HEIGHT_ESTIMATE - bottomPadding + POPUP_TOP_OFFSET;
  return { left, top: Math.min(maxTop, preferredTop), width: POPUP_WIDTH };
}

export function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = 'Tap to select date',
  iconName = 'event',
  style,
  onOpen,
  onClose,
  bottomPadding = 0,
  variant = 'default',
}: DatePickerInputProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [inputLayout, setInputLayout] = useState<InputLayout | null>(null);
  const initialDate = parseToCalendarDate(value) || new Date().toISOString().slice(0, 10);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const containerRef = useRef<View>(null);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  const CALENDAR_THEME = {
    backgroundColor: theme.colors.surface,
    calendarBackground: theme.colors.surface,
    textSectionTitleColor: theme.colors.text.secondary,
    selectedDayBackgroundColor: theme.colors.primary,
    selectedDayTextColor: theme.colors.white,
    todayTextColor: theme.colors.primary,
    dayTextColor: theme.colors.text.primary,
    textDisabledColor: theme.colors.text.tertiary,
    arrowColor: theme.colors.primary,
    monthTextColor: theme.colors.text.primary,
    textDayFontSize: 14,
    textMonthFontSize: 14,
    textDayHeaderFontSize: 11,
  };

  useEffect(() => {
    const parsed = parseToCalendarDate(value);
    if (parsed) setCurrentDate(parsed);
  }, [value]);

  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      popupOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, { ...FADE_CONFIG, toValue: 1 }),
        Animated.timing(popupOpacity, { ...FADE_CONFIG, toValue: 1 }),
      ]).start();
    }
  }, [visible, backdropOpacity, popupOpacity]);

  const openPopup = useCallback(() => {
    onOpen?.();
    setTimeout(() => {
      containerRef.current?.measureInWindow((x, y, width, height) => {
        setInputLayout({ x, y, width, height });
        setVisible(true);
      });
    }, SCROLL_DELAY_MS);
  }, [onOpen]);

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { ...FADE_CONFIG, toValue: 0 }),
      Animated.timing(popupOpacity, { ...FADE_CONFIG, toValue: 0 }),
    ]).start(() => {
      setVisible(false);
      setInputLayout(null);
      onClose?.();
    });
  }, [backdropOpacity, popupOpacity, onClose]);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      setCurrentDate(day.dateString);
      onChange(formatCalendarDateToLongDisplay(day.dateString));
      closeModal();
    },
    [onChange, closeModal]
  );

  const displayText = value || '';
  const markedDates = currentDate
    ? { [currentDate]: { selected: true, selectedColor: theme.colors.primary } }
    : {};

  const popupStyle = inputLayout ? getPopupPosition(inputLayout, bottomPadding) : null;

  return (
    <View ref={containerRef} style={[styles.container, style]} collapsable={false}>
      {variant === 'glass' ? (
        <View style={[styles.glassWrapper, theme.glass.cardWrapperStyle]}>
          <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.glassBlur, glassStyles.blurContent]}>
            <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
            <View style={styles.glassContent}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
              </View>
              <Pressable
                style={[styles.valueRow, { borderColor: theme.glass.border }]}
                onPress={openPopup}
                accessibilityLabel={label}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name={iconName}
                  size={20}
                  color={theme.colors.text.secondary}
                  style={styles.icon}
                />
                <Text style={[styles.value, !displayText && styles.placeholder, { color: displayText ? theme.colors.text.primary : theme.colors.text.tertiary }]}>
                  {displayText || placeholder}
                </Text>
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.tertiary} />
              </Pressable>
            </View>
          </AdaptiveGlassView>
        </View>
      ) : (
        <>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{label}</Text>
          </View>
          <Pressable
            style={styles.valueRow}
            onPress={openPopup}
            accessibilityLabel={label}
            accessibilityRole="button"
          >
            <MaterialIcons
              name={iconName}
              size={20}
              color={theme.colors.text.secondary}
              style={styles.icon}
            />
            <Text style={[styles.value, !displayText && styles.placeholder, { color: displayText ? theme.colors.text.primary : theme.colors.text.tertiary }]}>
              {displayText || placeholder}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.tertiary} />
          </Pressable>
        </>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal}>
            <Animated.View
              style={[styles.backdrop, { opacity: backdropOpacity }]}
              pointerEvents="none"
            />
          </Pressable>
          {popupStyle != null && (
            <Animated.View
              style={[styles.popup, popupStyle, { opacity: popupOpacity, backgroundColor: theme.colors.surface }, shadows.lg]}
              pointerEvents="box-none"
            >
              <View style={styles.calendarContainer}>
                <Calendar
                  initialDate={initialDate}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  enableSwipeMonths
                  theme={CALENDAR_THEME}
                  renderArrow={(direction) => (
                    <MaterialIcons
                      name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                />
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
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
  labelRow: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: spacing.sm,
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamilies.regular,
  },
  placeholder: {
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  popup: {
    position: 'absolute',
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
  },
  calendarContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
