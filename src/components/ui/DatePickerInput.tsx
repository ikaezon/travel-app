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
import { colors, spacing, borderRadius, shadows } from '../../theme';
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

const CALENDAR_THEME = {
  backgroundColor: colors.surface.light,
  calendarBackground: colors.surface.light,
  textSectionTitleColor: colors.text.secondary.light,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: colors.white,
  todayTextColor: colors.primary,
  dayTextColor: colors.text.primary.light,
  textDisabledColor: colors.text.tertiary.light,
  arrowColor: colors.primary,
  monthTextColor: colors.text.primary.light,
  textDayFontSize: 14,
  textMonthFontSize: 14,
  textDayHeaderFontSize: 11,
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
  /** Match page bottom padding so the calendar modal doesn't extend into it (e.g. spacing.xxl + keyboardHeight). */
  bottomPadding?: number;
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
}: DatePickerInputProps) {
  const [visible, setVisible] = useState(false);
  const [inputLayout, setInputLayout] = useState<InputLayout | null>(null);
  const initialDate = parseToCalendarDate(value) || new Date().toISOString().slice(0, 10);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const containerRef = useRef<View>(null);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

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
    ? { [currentDate]: { selected: true, selectedColor: colors.primary } }
    : {};

  const popupStyle = inputLayout ? getPopupPosition(inputLayout, bottomPadding) : null;

  return (
    <View ref={containerRef} style={[styles.container, style]} collapsable={false}>
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
          color={colors.text.secondary.light}
          style={styles.icon}
        />
        <Text style={[styles.value, !displayText && styles.placeholder]}>
          {displayText || placeholder}
        </Text>
        <MaterialIcons name="chevron-right" size={24} color={colors.text.tertiary.light} />
      </Pressable>

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
              style={[styles.popup, popupStyle, { opacity: popupOpacity }, shadows.lg]}
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
                      color={colors.primary}
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
  labelRow: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary.light,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.light,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    marginRight: spacing.sm,
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: colors.text.primary.light,
  },
  placeholder: {
    color: colors.text.tertiary.light,
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
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  calendarContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
