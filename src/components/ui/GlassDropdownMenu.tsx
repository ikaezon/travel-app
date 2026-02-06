import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontFamilies, glassConstants } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from './AdaptiveGlassView';

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
}

export function GlassDropdownMenu({
  visible,
  onClose,
  actions,
  onSelect,
  style,
  uniformItemBackground,
}: GlassDropdownMenuProps) {
  const theme = useTheme();
  const animation = useMenuAnimation(visible);

  if (!visible) return null;

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
          overflow: 'hidden',
          borderWidth: MENU.borderWidth,
          borderColor: theme.glassColors.borderStrong,
        },
        style,
        {
          opacity: animation.opacity,
          transform: [{ scale: animation.scale }],
        },
      ]}
    >
      <AdaptiveGlassView intensity={MENU.blurIntensity} darkIntensity={20} glassEffectStyle="clear" absoluteFill style={{
        borderRadius: MENU.borderRadius,
        overflow: 'hidden',
      }} />
      <View style={[StyleSheet.absoluteFillObject, {
        backgroundColor: theme.isDark ? 'rgba(40, 40, 45, 0.60)' : theme.glassColors.overlay,
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
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                },
                uniformItemBackground && {
                  backgroundColor: theme.glassColors.menuItemPressed,
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
    </Animated.View>
  );
}

