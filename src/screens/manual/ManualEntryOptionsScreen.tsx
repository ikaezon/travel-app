import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../../theme';
import { MainStackParamList } from '../../navigation/types';
import { MANUAL_ENTRY_OPTIONS } from '../../constants';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function ManualEntryOptionsScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary.light} />
        </Pressable>
        <Text style={styles.headerTitle}>Manual Entry</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>What would you like to add?</Text>
        <View style={styles.optionsList}>
          {MANUAL_ENTRY_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
              onPress={() => navigation.navigate(option.route)}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: option.iconBgColor }]}>
                <MaterialIcons name={option.iconName} size={28} color={option.iconColor} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.text.secondary.light} />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary.light,
    marginBottom: spacing.xl,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  optionCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  optionIconContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.full,
  },
  optionTextContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    lineHeight: 20,
  },
  optionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.secondary.light,
    lineHeight: 20,
  },
});
