import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { fontFamilies, colors } from '../../theme';

function useMenuAnimation(visible: boolean) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const hasAnimatedForCurrentVisibility = useRef(false);

  useEffect(() => {
    if (visible) {
      if (!hasAnimatedForCurrentVisibility.current) {
        hasAnimatedForCurrentVisibility.current = true;
        requestAnimationFrame(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              damping: 14,
              stiffness: 200,
            }),
          ]).start();
        });
      }
    } else {
      hasAnimatedForCurrentVisibility.current = false;
      opacity.setValue(0);
      scale.setValue(0.96);
    }
  }, [visible, opacity, scale]);

  return { opacity, scale };
}

// Menu styling - kept inline for clarity
const MENU = {
  borderRadius: 16,
  blurIntensity: 48,
  overlay: 'rgba(255, 255, 255, 0.28)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.8)',
  itemBorder: 'rgba(148, 163, 184, 0.25)',
  itemPressed: 'rgba(0, 0, 0, 0.04)',
  text: colors.text.primary.light,
  primary: colors.status.info,
  error: colors.status.error,
  paddingVertical: 12,
  paddingHorizontal: 16,
  iconGap: 8,
} as const;

export interface GlassDropdownAction {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  destructive?: boolean;
}

interface GlassDropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  actions: GlassDropdownAction[];
  onSelect: (index: number) => void;
  style?: StyleProp<ViewStyle>;
  /** When true, applies a uniform subtle background to all menu items */
  uniformItemBackground?: boolean;
}

export function GlassDropdownMenu({
  visible,
  onClose,
  actions,
  onSelect,
  style,
  uniformItemBackground,
}: GlassDropdownMenuProps) {
  const animation = useMenuAnimation(visible);

  if (!visible) return null;

  const handlePress = (index: number) => {
    onSelect(index);
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: animation.opacity,
          transform: [{ scale: animation.scale }],
        },
      ]}
    >
      <BlurView intensity={MENU.blurIntensity} tint="light" style={[StyleSheet.absoluteFill, styles.blurContent]} />
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} pointerEvents="none" />
      <View style={styles.content}>
        {actions.map((action, index) => {
          const isLast = index === actions.length - 1;
          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.item,
                !isLast && styles.itemBorder,
                uniformItemBackground && styles.itemUniformBackground,
                pressed && styles.itemPressed,
              ]}
              onPress={() => handlePress(index)}
            >
              {action.icon && (
                <MaterialIcons
                  name={action.icon}
                  size={20}
                  color={action.destructive ? MENU.error : MENU.primary}
                  style={styles.icon}
                />
              )}
              <Text
                style={[
                  styles.label,
                  action.destructive && styles.labelDestructive,
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    minWidth: 180,
    borderRadius: MENU.borderRadius,
    overflow: 'hidden',
    borderWidth: MENU.borderWidth,
    borderColor: MENU.borderColor,
  },
  blurContent: {
    borderRadius: MENU.borderRadius,
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: MENU.overlay,
  },
  content: {
    position: 'relative',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MENU.paddingVertical,
    paddingHorizontal: MENU.paddingHorizontal,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: MENU.itemBorder,
  },
  itemPressed: {
    backgroundColor: MENU.itemPressed,
  },
  itemUniformBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  icon: {
    marginRight: MENU.iconGap,
  },
  label: {
    fontSize: 15,
    fontFamily: fontFamilies.medium,
    color: MENU.text,
  },
  labelDestructive: {
    color: MENU.error,
  },
});
