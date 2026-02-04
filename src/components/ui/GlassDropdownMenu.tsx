import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { useMenuAnimation } from '../../hooks';

const MENU_RADIUS = 20;
const BLUR_INTENSITY = 80;
const BLUR_TINT = 'systemThinMaterialLight';

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
  style?: ViewStyle;
  /** When true, all items share the same background (no darker background for destructive) */
  uniformItemBackground?: boolean;
}

export function GlassDropdownMenu({
  visible,
  onClose,
  actions,
  onSelect,
  style,
  uniformItemBackground = false,
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
        styles.wrapper,
        style,
        {
          opacity: animation.opacity,
          transform: [{ scale: animation.scale }],
        },
      ]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={BLUR_INTENSITY}
        tint={BLUR_TINT}
        style={styles.blur}
      >
        <View style={styles.borderOverlay} pointerEvents="box-none">
          {actions.map((action, index) => {
            const isDestructive = action.destructive;
            const useDestructiveBackground = isDestructive && !uniformItemBackground;
            return (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.item,
                  useDestructiveBackground && (pressed ? styles.itemDestructivePressed : styles.itemDestructive),
                  (!useDestructiveBackground && pressed) && styles.itemPressed,
                  pressed && styles.itemPressedScale,
                ]}
                onPress={() => handlePress(index)}
              >
                {action.icon && (
                  <MaterialIcons
                    name={action.icon}
                    size={20}
                    color={isDestructive ? colors.status.error : colors.primary}
                    style={styles.itemIcon}
                  />
                )}
                <Text
                  style={[styles.itemLabel, isDestructive && styles.itemLabelDestructive]}
                >
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const innerRadius = MENU_RADIUS - 1;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 10,
    minWidth: 200,
    borderRadius: MENU_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  blur: {
    borderRadius: innerRadius,
    overflow: 'hidden',
  },
  borderOverlay: {
    borderRadius: innerRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  itemDestructive: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  itemPressed: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  itemPressedScale: {
    transform: [{ scale: 0.99 }],
  },
  itemDestructivePressed: {
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  itemIcon: {
    marginRight: spacing.md,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  itemLabelDestructive: {
    color: colors.status.error,
  },
});
