import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface LoadingViewProps {
  style?: object;
}

export function LoadingView({ style }: LoadingViewProps) {
  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
