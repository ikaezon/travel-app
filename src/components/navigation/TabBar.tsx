import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../theme';
import { TAB_CONFIG } from '../../constants';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, spacing.lg);

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <BlurView intensity={24} tint="light" style={styles.blurContainer}>
        <View style={styles.glassOverlay} pointerEvents="none" />
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name] || { icon: 'home', label: route.name };

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
              >
                <MaterialIcons
                  name={config.icon}
                  size={26}
                  color={isFocused ? colors.primary : colors.text.tertiary.light}
                />
                <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>
                  {config.label}
                </Text>
                {isFocused && <View style={styles.activeIndicator} />}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  blurContainer: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 32, // rounded-[2rem]
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)', // border-white/60
    position: 'relative',
    height: 64, // h-16
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // bg-white/40-45
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    position: 'relative',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
  labelActive: {
    color: colors.primary,
  },
  labelInactive: {
    color: colors.text.tertiary.light,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -spacing.xs,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
