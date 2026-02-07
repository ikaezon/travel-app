import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontFamilies, glassConstants } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView, isNativeGlassActive } from './AdaptiveGlassView';

const SCALE_START = 0.88;

function useMenuAnimation(visible: boolean, useGlassAnimation: boolean) {
  // Native GlassView doesn't initialize properly when container starts at opacity 0.
  // Use scale-only animation when native glass is active.
  const opacity = useRef(new Animated.Value(useGlassAnimation ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(SCALE_START)).current;
  const hasAnimatedForCurrentVisibility = useRef(false);

  useEffect(() => {
    if (visible) {
      if (!hasAnimatedForCurrentVisibility.current) {
        hasAnimatedForCurrentVisibility.current = true;
        requestAnimationFrame(() => {
          if (useGlassAnimation) {
            // Scale-only animation for native glass - keeps opacity at 1
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              damping: 12,
              stiffness: 180,
            }).start();
          } else {
            // Standard opacity + scale animation for BlurView
            Animated.parallel([
              Animated.timing(opacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
              }),
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                damping: 12,
                stiffness: 180,
              }),
            ]).start();
          }
        });
      }
    } else {
      hasAnimatedForCurrentVisibility.current = false;
      opacity.setValue(useGlassAnimation ? 1 : 0);
      scale.setValue(SCALE_START);
    }
  }, [visible, opacity, scale, useGlassAnimation]);

  return { opacity, scale };
}

// Menu styling constants
const MENU = {
  borderRadius: glassConstants.radius.card,
  blurIntensity: 48,
  borderWidth: 1,
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
  /** When true, hides separator lines between menu items */
  hideSeparators?: boolean;
}

export function GlassDropdownMenu({
  visible,
  onClose,
  actions,
  onSelect,
  style,
  uniformItemBackground,
  hideSeparators = false,
}: GlassDropdownMenuProps) {
  const theme = useTheme();
  const useGlassAnimation = isNativeGlassActive(theme.isDark);
  const animation = useMenuAnimation(visible, useGlassAnimation);

  if (!visible) return null;

  const effectiveBorderWidth = useGlassAnimation ? 0 : MENU.borderWidth;
  const innerRadius = MENU.borderRadius - effectiveBorderWidth;

  const handlePress = (index: number) => {
    onSelect(index);
    onClose();
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          minWidth: 180,
          borderRadius: MENU.borderRadius,
          borderWidth: MENU.borderWidth,
          borderColor: theme.glass.borderStrong,
        },
        useGlassAnimation && { borderWidth: 0 },
        style,
        {
          opacity: animation.opacity,
          transform: [{ scale: animation.scale }],
        },
      ]}
    >
      <View
        style={{
          borderRadius: innerRadius,
          overflow: 'hidden',
        }}
        pointerEvents="box-none"
      >
        <AdaptiveGlassView intensity={MENU.blurIntensity} darkIntensity={20} glassEffectStyle="clear" absoluteFill style={{
          borderRadius: innerRadius,
          overflow: 'hidden',
        }} />
        <View style={[StyleSheet.absoluteFillObject, {
          backgroundColor: theme.glass.menuOverlay,
        }]} pointerEvents="none" />
        <View style={{ position: 'relative' }}>
        {actions.map((action, index) => {
          const isLast = index === actions.length - 1;
          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: MENU.paddingVertical,
                  paddingHorizontal: MENU.paddingHorizontal,
                },
                !isLast && !hideSeparators && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                },
                uniformItemBackground && {
                  backgroundColor: theme.glass.menuItemPressed,
                },
                pressed && {
                  backgroundColor: theme.colors.surface,
                },
              ]}
              onPress={() => handlePress(index)}
            >
              {action.icon && (
                <MaterialIcons
                  name={action.icon}
                  size={20}
                  color={action.destructive ? theme.colors.status.error : theme.colors.status.info}
                  style={{ marginRight: MENU.iconGap }}
                />
              )}
              <Text
                style={[
                  {
                    fontSize: 15,
                    fontFamily: fontFamilies.medium,
                    color: theme.colors.text.primary,
                  },
                  action.destructive && {
                    color: theme.colors.status.error,
                  },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      </View>
    </Animated.View>
  );
}

