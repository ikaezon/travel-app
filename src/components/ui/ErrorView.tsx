import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, fontFamilies } from '../../theme';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface ErrorViewProps {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  style?: object;
}

const DEFAULT_TITLE = 'Something went wrong';
const DEFAULT_SUBTITLE = 'Please try again in a moment.';

export function ErrorView({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  onRetry,
  style,
}: ErrorViewProps) {
  const theme = useTheme();
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityRole="alert"
    >
      <MaterialIcons name="error-outline" size={32} color={theme.colors.status.error} />
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text>
      {onRetry && (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.primary }]}>Try again</Text>
        </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  retryButtonText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
  },
});
