import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  ViewStyle,
  Animated,
  InteractionManager,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  spacing,
  fontFamilies,
  glassStyles,
  glassConstants,
  borderRadius,
} from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';
import { formatTimeTo12Hour } from '../../utils/dateFormat';

const PICKER_HEIGHT = 320;
const ANIMATION_DURATION = 250;

export interface TimePickerInputProps {
  label: string;
  value: string;
  onChange: (formattedTime: string) => void;
  placeholder?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
  onOpen?: () => void;
  onClose?: () => void;
  variant?: 'default' | 'glass';
}

function parseTimeToDate(value: string): Date {
  const date = new Date();
  date.setSeconds(0);
  date.setMilliseconds(0);

  if (!value) {
    date.setHours(12, 0);
    return date;
  }

  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    date.setHours(hours, minutes);
  }

  return date;
}

function formatDateToTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');

  return `${hoursStr}:${minutesStr}`;
}

export function TimePickerInput({
  label,
  value,
  onChange,
  placeholder = 'Tap to select time',
  iconName = 'schedule',
  style,
  onOpen,
  onClose,
  variant = 'default',
}: TimePickerInputProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [pickerReady, setPickerReady] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(() => parseTimeToDate(value));

  const currentDate = useMemo(() => parseTimeToDate(value), [value]);

  const slideAnim = useRef(new Animated.Value(PICKER_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openPicker = useCallback(() => {
    setTempDate(parseTimeToDate(value));
    setPickerReady(false);
    setVisible(true);
    onOpen?.();
  }, [value, onOpen]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(PICKER_HEIGHT);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 300,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      InteractionManager.runAfterInteractions(() => {
        setPickerReady(true);
      });
    }
  }, [visible]);

  const closePicker = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: PICKER_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setPickerReady(false);
      onClose?.();
    });
  }, [slideAnim, backdropOpacity, onClose]);

  const handleChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setVisible(false);
        if (event.type === 'set' && selectedDate) {
          onChange(formatDateToTime(selectedDate));
        }
        onClose?.();
      } else {
        if (selectedDate) {
          setTempDate(selectedDate);
        }
      }
    },
    [onChange, onClose]
  );

  const handleConfirm = useCallback(() => {
    onChange(formatDateToTime(tempDate));
    closePicker();
  }, [tempDate, onChange, closePicker]);

  const displayText = value ? formatTimeTo12Hour(value) : '';

  return (
    <View style={[styles.container, style]}>
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
                onPress={openPicker}
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
            onPress={openPicker}
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

      {Platform.OS === 'ios' ? (
        <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={closePicker}
          statusBarTranslucent
        >
          <Pressable style={styles.modalContainer} onPress={closePicker}>
            <Animated.View
              style={[styles.backdrop, { opacity: backdropOpacity }]}
              pointerEvents="none"
            />
            <Animated.View
              style={[
                styles.pickerSheetWrapper,
                { transform: [{ translateY: slideAnim }], borderColor: theme.glass.borderStrong },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <AdaptiveGlassView
                intensity={40}
                darkIntensity={10}
                glassEffectStyle="clear"
                style={styles.pickerSheetBlur}
              >
                <View style={[styles.pickerSheetOverlay, { backgroundColor: theme.glass.menuOverlay }]} pointerEvents="none" />

                <View style={styles.pickerHeader}>
                  <Pressable 
                    onPress={closePicker} 
                    style={({ pressed }) => [
                      styles.headerButton,
                      pressed && { backgroundColor: theme.glass.menuItemPressed },
                    ]}
                  >
                    <Text style={[styles.cancelText, { color: theme.colors.text.secondary }]}>Cancel</Text>
                  </Pressable>
                  
                  <View style={styles.headerTitleContainer}>
                    <MaterialIcons 
                      name="schedule" 
                      size={18} 
                      color={theme.colors.primary} 
                      style={styles.headerIcon}
                    />
                    <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Select Time</Text>
                  </View>
                  
                  <Pressable 
                    onPress={handleConfirm} 
                    style={({ pressed }) => [
                      styles.headerButton,
                      pressed && { backgroundColor: theme.glass.menuItemPressed },
                    ]}
                  >
                    <Text style={[styles.confirmText, { color: theme.colors.primary }]}>Done</Text>
                  </Pressable>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.glass.menuItemBorder }]} />

                <View style={styles.pickerContainer}>
                  {pickerReady ? (
                    <DateTimePicker
                      value={tempDate}
                      mode="time"
                      display="spinner"
                      onChange={handleChange}
                      style={styles.picker}
                      textColor={theme.colors.text.primary}
                    />
                  ) : (
                    <View style={styles.pickerPlaceholder} />
                  )}
                </View>

                <View style={styles.bottomAccent} />
              </AdaptiveGlassView>
            </Animated.View>
          </Pressable>
        </Modal>
      ) : (
        visible && (
          <DateTimePicker
            value={currentDate}
            mode="time"
            display="spinner"
            onChange={handleChange}
          />
        )
      )}
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
    paddingHorizontal: spacing.sm,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  pickerSheetWrapper: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    borderRadius: glassConstants.radius.cardLarge,
    borderWidth: glassConstants.borderWidth.card,
    overflow: 'hidden',
  },
  pickerSheetBlur: {
    borderRadius: glassConstants.radiusInner.cardLarge,
    overflow: 'hidden',
  },
  pickerSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: glassConstants.radius.icon,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fontFamilies.semibold,
    letterSpacing: -0.3,
  },
  cancelText: {
    fontSize: 17,
    fontFamily: fontFamilies.regular,
  },
  confirmText: {
    fontSize: 17,
    fontFamily: fontFamilies.semibold,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.md,
  },
  pickerContainer: {
    paddingVertical: spacing.sm,
  },
  picker: {
    height: 200,
  },
  pickerPlaceholder: {
    height: 200,
  },
  bottomAccent: {
    height: 3,
    marginHorizontal: 100,
    marginBottom: spacing.md,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
