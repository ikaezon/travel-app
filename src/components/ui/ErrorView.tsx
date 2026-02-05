import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, fontFamilies } from '../../theme';

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
  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityRole="alert"
    >
      <MaterialIcons name="error-outline" size={32} color={colors.status.error} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
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
    color: colors.text.primary.light,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary.light,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    fontSize: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
});
