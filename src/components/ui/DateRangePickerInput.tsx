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
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { colors, spacing, borderRadius, shadows, fontFamilies, glassStyles, glassColors } from '../../theme';
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
  /** Use liquid glass card styling */
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
  tempEnd: string | null
): { [key: string]: object } {
  if (!tempStart) return {};
  if (!tempEnd || tempStart === tempEnd) {
    return {
      [tempStart]: {
        startingDay: true,
        endingDay: true,
        color: colors.primary,
        textColor: colors.white,
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
      color: colors.primary,
      textColor: colors.white,
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
  const markedDates = buildMarkedDates(tempStart, tempEnd);

  const popupLeft = inputLayout
    ? Math.max(spacing.sm, Math.min(inputLayout.x + inputLayout.width / 2 - POPUP_WIDTH / 2, SCREEN_WIDTH - POPUP_WIDTH - spacing.sm))
    : 0;
  const popupTop = inputLayout ? inputLayout.y + inputLayout.height + spacing.sm : 0;

  return (
    <View ref={containerRef} style={[styles.container, style]} collapsable={false}>
      {variant === 'glass' ? (
        <View style={styles.glassWrapper}>
          <BlurView intensity={24} tint="light" style={[styles.glassBlur, glassStyles.blurContent]}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.glassContent}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, styles.labelGlass]}>{label}</Text>
              </View>
              <Pressable
                style={[styles.valueRow, styles.valueRowGlass]}
                onPress={openPopup}
                accessibilityLabel={label}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name="event"
                  size={20}
                  color={colors.text.secondary.light}
                  style={styles.icon}
                />
                <Text style={[styles.value, !displayText && styles.placeholder]}>
                  {displayText || placeholder}
                </Text>
                <MaterialIcons name="chevron-right" size={24} color={colors.text.tertiary.light} />
              </Pressable>
            </View>
          </BlurView>
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
              name="event"
              size={20}
              color={colors.text.secondary.light}
              style={styles.icon}
            />
            <Text style={[styles.value, !displayText && styles.placeholder]}>
              {displayText || placeholder}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.text.tertiary.light} />
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
                },
                shadows.lg,
              ]}
              pointerEvents="box-none"
            >
              <View style={styles.topBar}>
                <Pressable style={styles.cancelButton} onPress={closeModal} hitSlop={12}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.doneButton} onPress={handleDone} hitSlop={12}>
                  <Text style={styles.doneText}>Done</Text>
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
                  }}
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
  labelRow: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary.light,
  },
  labelGlass: {
    color: colors.text.primary.light,
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
  valueRowGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: glassColors.border,
  },
  icon: {
    marginRight: spacing.sm,
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamilies.regular,
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  cancelButton: {
    padding: spacing.xs,
    minWidth: 56,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.text.secondary.light,
  },
  doneButton: {
    padding: spacing.xs,
    minWidth: 56,
    alignItems: 'flex-end',
  },
  doneText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
  calendarContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
