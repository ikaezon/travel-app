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
import { formatCalendarDateToDisplay } from '../../utils/dateFormat';

const POPUP_FADE_DURATION = 150;
const POPUP_WIDTH = 320;
const SCROLL_DELAY_MS = 150;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type InputLayout = { x: number; y: number; width: number; height: number };
export interface DateRangePickerInputProps {
  label: string;
  startDate: string | null;
  endDate: string | null;
  onRangeChange: (start: string | null, end: string | null) => void;
  placeholder?: string;
  style?: ViewStyle;
  onOpen?: () => void;
  onClose?: () => void;
  variant?: 'default' | 'glass';
}

function formatDateRangeDisplay(startDate: string | null, endDate: string | null): string {
  if (!startDate) return '';
  if (!endDate || startDate === endDate) {
    return formatCalendarDateToDisplay(startDate);
  }
  return `${formatCalendarDateToDisplay(startDate)} - ${formatCalendarDateToDisplay(endDate)}`;
}

function buildMarkedDates(
  tempStart: string | null,
  tempEnd: string | null,
  primaryColor: string,
  whiteColor: string
): { [key: string]: object } {
  if (!tempStart) return {};
  if (!tempEnd || tempStart === tempEnd) {
    return {
      [tempStart]: {
        startingDay: true,
        endingDay: true,
        color: primaryColor,
        textColor: whiteColor,
      },
    };
  }
  const [startY, startM, startD] = tempStart.split('-').map(Number);
  const [endY, endM, endD] = tempEnd.split('-').map(Number);
  const startTs = new Date(startY, startM - 1, startD).getTime();
  const endTs = new Date(endY, endM - 1, endD).getTime();
  const actualStart = startTs <= endTs ? tempStart : tempEnd;
  const actualEnd = startTs <= endTs ? tempEnd : tempStart;
  const marked: { [key: string]: object } = {};
  const d = new Date(actualStart);
  const e = new Date(actualEnd);
  while (d.getTime() <= e.getTime()) {
    const key = d.toISOString().slice(0, 10);
    marked[key] = {
      startingDay: key === actualStart,
      endingDay: key === actualEnd,
      color: primaryColor,
      textColor: whiteColor,
    };
    d.setDate(d.getDate() + 1);
  }
  return marked;
}

export function DateRangePickerInput({
  label,
  startDate,
  endDate,
  onRangeChange,
  placeholder = 'Tap to select dates',
  style,
  onOpen,
  onClose,
  variant = 'default',
}: DateRangePickerInputProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [inputLayout, setInputLayout] = useState<InputLayout | null>(null);
  const [tempRange, setTempRange] = useState<{ start: string | null; end: string | null }>({
    start: startDate,
    end: endDate,
  });
  const tempStart = tempRange.start;
  const tempEnd = tempRange.end;
  const [initialDate] = useState(() => startDate || new Date().toISOString().slice(0, 10));
  const containerRef = useRef<View>(null);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setTempRange({ start: startDate, end: endDate });
    }
  }, [visible, startDate, endDate]);

  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      popupOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: POPUP_FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: POPUP_FADE_DURATION,
          useNativeDriver: true,
        }),
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
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: POPUP_FADE_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: POPUP_FADE_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setInputLayout(null);
      onClose?.();
    });
  }, [backdropOpacity, popupOpacity, onClose]);

  const handleDone = useCallback(() => {
    onRangeChange(tempStart, tempEnd);
    closeModal();
  }, [tempStart, tempEnd, onRangeChange, closeModal]);

  const handleDayPress = useCallback((day: { dateString: string }) => {
    const date = day.dateString;
    setTempRange((prev) => {
      if (!prev.start) {
        return { start: date, end: null };
      }
      if (prev.end != null) {
        return { start: date, end: null };
      }
      if (date < prev.start) {
        return { start: date, end: prev.start };
      }
      return { start: prev.start, end: date };
    });
  }, []);

  const displayText = formatDateRangeDisplay(startDate, endDate);
  const markedDates = buildMarkedDates(tempStart, tempEnd, theme.colors.primary, theme.colors.white);

  const popupLeft = inputLayout
    ? Math.max(spacing.sm, Math.min(inputLayout.x + inputLayout.width / 2 - POPUP_WIDTH / 2, SCREEN_WIDTH - POPUP_WIDTH - spacing.sm))
    : 0;
  const popupTop = inputLayout ? inputLayout.y + inputLayout.height + spacing.sm : 0;

  return (
    <View ref={containerRef} style={[styles.container, style]} collapsable={false}>
      {variant === 'glass' ? (
        <View style={[styles.glassWrapper, theme.glass.cardWrapperStyle]}>
          <AdaptiveGlassView intensity={24} darkIntensity={10} glassEffectStyle="clear" style={[styles.glassBlur, glassStyles.blurContent]}>
            <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />
            <View style={styles.glassContent}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>{label}</Text>
              </View>
              <Pressable
                style={[styles.valueRow, { backgroundColor: theme.glass.fill, borderColor: theme.glass.border }]}
                onPress={openPopup}
                accessibilityLabel={label}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name="event"
                  size={20}
                  color={theme.colors.text.secondary}
                  style={styles.icon}
                />
                <Text style={[styles.value, { color: theme.colors.text.primary }, !displayText && { color: theme.colors.text.tertiary }]}>
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
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
          </View>
          <Pressable
            style={[styles.valueRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            onPress={openPopup}
            accessibilityLabel={label}
            accessibilityRole="button"
          >
            <MaterialIcons
              name="event"
              size={20}
              color={theme.colors.text.secondary}
              style={styles.icon}
            />
            <Text style={[styles.value, { color: theme.colors.text.primary }, !displayText && { color: theme.colors.text.tertiary }]}>
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
          {inputLayout != null && (
            <Animated.View
              style={[
                styles.popup,
                {
                  left: popupLeft,
                  top: popupTop,
                  width: POPUP_WIDTH,
                  opacity: popupOpacity,
                  backgroundColor: theme.colors.surface,
                },
                shadows.lg,
              ]}
              pointerEvents="box-none"
            >
              <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}>
                <Pressable style={styles.cancelButton} onPress={closeModal} hitSlop={12}>
                  <Text style={[styles.cancelText, { color: theme.colors.text.secondary }]}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.doneButton} onPress={handleDone} hitSlop={12}>
                  <Text style={[styles.doneText, { color: theme.colors.primary }]}>Done</Text>
                </Pressable>
              </View>
              <View style={styles.calendarContainer}>
                <Calendar
                  initialDate={initialDate}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  markingType="period"
                  enableSwipeMonths
                  theme={{
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
                  }}
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
  },
  icon: {
    marginRight: spacing.sm,
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamilies.regular,
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  cancelButton: {
    padding: spacing.xs,
    minWidth: 56,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
  },
  doneButton: {
    padding: spacing.xs,
    minWidth: 56,
    alignItems: 'flex-end',
  },
  doneText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
  },
  calendarContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
