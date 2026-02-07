import { StyleSheet, ViewStyle } from 'react-native';

/**
 * Liquid Glass Design System
 *
 * Static structural styles (borderRadius, overflow) live here.
 * Theme-dependent values (colors, borders, shadows) live in ResolvedGlass,
 * accessed via `useTheme().glass`.
 */

// ============================================
// CONSTANTS (static, never change per theme)
// ============================================

export const glassConstants = {
  blur: {
    card: 24,
    icon: 50,
    nav: 24,
    menu: 48,
  },
  radius: {
    card: 28,
    cardLarge: 32,
    cardXLarge: 40,
    icon: 16,
    pill: 9999,
  },
  radiusInner: {
    card: 28,
    cardLarge: 32,
    cardXLarge: 40,
    icon: 16,
  },
  borderWidth: {
    card: 2,
    cardThin: 1,
    icon: 1.5,
    iconThin: 0.5,
  },
} as const;

// ============================================
// STRUCTURAL STYLES (layout only, no colors)
// ============================================

export const glassStyles = StyleSheet.create({
  /** Card wrapper — structural only. Apply theme.glass.cardWrapperStyle for colors/borders. */
  cardWrapper: {
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
  },

  /** Large card wrapper (TripCard) */
  cardWrapperLarge: {
    borderRadius: glassConstants.radius.cardXLarge,
    overflow: 'hidden',
  },

  /** BlurView clipping — clips blur to rounded corners */
  blurContent: {
    borderRadius: glassConstants.radiusInner.card,
    overflow: 'hidden',
  },
  blurContentLarge: {
    borderRadius: glassConstants.radiusInner.cardLarge,
    overflow: 'hidden',
  },
  blurContentXLarge: {
    borderRadius: glassConstants.radiusInner.cardXLarge,
    overflow: 'hidden',
  },
  blurContentIcon: {
    borderRadius: glassConstants.radiusInner.icon,
    overflow: 'hidden',
  },
  blurContentPill: {
    borderRadius: glassConstants.radius.pill,
    overflow: 'hidden',
  },

  /** Card overlay — absolute fill, backgroundColor comes from theme.glass.overlay */
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  /** Icon container — structural only. Apply theme.glass.iconContainerStyle for colors/borders. */
  iconContainer: {
    borderRadius: glassConstants.radius.icon,
    overflow: 'hidden',
  },

  /** Pill container — structural only */
  pillContainer: {
    borderRadius: glassConstants.radius.pill,
    overflow: 'hidden',
  },

  /** Nav bar wrapper — structural only. Apply theme.glass.navWrapperStyle for colors/borders. */
  navBarWrapper: {
    borderRadius: glassConstants.radius.cardLarge,
    overflow: 'hidden',
  },

  /** Dropdown menu — structural only */
  menuDropdown: {
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
    minWidth: 160,
  },

  /** Blur fill layer for dropdown menus */
  menuBlurFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  /** Overlay fill layer for dropdown menus */
  menuOverlayFill: {
    ...StyleSheet.absoluteFillObject,
  },

  /** Menu item row */
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  /** Menu item pressed state — backgroundColor comes from theme.glass.menuItemPressed */
  menuItemPressed: {},

  /** Menu item border */
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

// ============================================
// RESOLVED GLASS (theme-aware)
// ============================================

export interface CardShadowNative {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ResolvedGlass {
  // ── Overlay colors ──
  overlay: string;
  overlayStrong: string;
  overlayBlue: string;
  overlayOrange: string;

  // ── Border colors ──
  border: string;
  borderStrong: string;
  borderBlue: string;
  borderOrange: string;
  borderShimmerBlue: string;
  borderShimmerOrange: string;

  // ── Menu ──
  menuItemBorder: string;
  menuOverlay: string;
  menuItemPressed: string;

  // ── Shadow colors ──
  shadow: string;
  shadowMedium: string;

  // ── Card semantics ──
  cardBorderWidth: number;
  cardBoxShadow: string;
  cardHighlight?: string;

  // ── Icon semantics ──
  iconBg: string;
  badgeOverlay: string;

  // ── Glass fill (solid background) ──
  fill: string;

  // ── Box shadow strings ──
  navBoxShadow: string;
  elevatedBoxShadow: string;
  cardShadowNative?: CardShadowNative;

  // ── Pre-computed style objects (eliminates isDark conditionals in components) ──
  cardWrapperStyle: ViewStyle;
  iconContainerStyle: ViewStyle;
  navWrapperStyle: ViewStyle;
  menuDropdownStyle: ViewStyle;
  pillContainerStyle: ViewStyle;
}

export function getResolvedGlass(isDark: boolean): ResolvedGlass {
  if (isDark) {
    return {
      // Overlays
      overlay: 'rgba(40, 40, 45, 0.35)',
      overlayStrong: 'rgba(40, 40, 45, 0.40)',
      overlayBlue: 'rgba(96, 165, 250, 0.15)',
      overlayOrange: 'rgba(251, 146, 60, 0.12)',

      // Borders
      border: 'rgba(255, 255, 255, 0.18)',
      borderStrong: 'rgba(255, 255, 255, 0.22)',
      borderBlue: 'rgba(96, 165, 250, 0.30)',
      borderOrange: 'rgba(251, 146, 60, 0.30)',
      borderShimmerBlue: 'rgba(96, 165, 250, 0.40)',
      borderShimmerOrange: 'rgba(251, 146, 60, 0.40)',

      // Menu
      menuItemBorder: 'rgba(255, 255, 255, 0.08)',
      menuOverlay: 'rgba(30, 30, 35, 0.60)',
      menuItemPressed: 'rgba(255, 255, 255, 0.05)',

      // Shadow colors
      shadow: 'rgba(0, 0, 0, 0.50)',
      shadowMedium: 'rgba(0, 0, 0, 0.60)',

      // Card
      cardBorderWidth: 0,
      cardBoxShadow: '0 0 0 0 transparent',
      cardHighlight: 'rgba(255, 255, 255, 0.10)',

      // Icon
      iconBg: 'rgba(255, 255, 255, 0.06)',
      badgeOverlay: 'rgba(0, 0, 0, 0.35)',

      // Fill
      fill: 'rgba(80, 80, 85, 0.15)',

      // Box shadows
      navBoxShadow: '0 -10px 40px -5px rgba(0, 0, 0, 0.60)',
      elevatedBoxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
      cardShadowNative: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
        elevation: 24,
      },

      // Pre-computed styles
      cardWrapperStyle: {
        borderWidth: 0,
      },
      iconContainerStyle: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.22)',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
      },
      navWrapperStyle: {
        borderWidth: 0,
        boxShadow: '0 -10px 40px -5px rgba(0, 0, 0, 0.60)',
      },
      menuDropdownStyle: {
        borderWidth: 0,
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
      },
      pillContainerStyle: {
        borderWidth: 0,
      },
    };
  }

  return {
    // Overlays
    overlay: 'rgba(255, 255, 255, 0.35)',
    overlayStrong: 'rgba(255, 255, 255, 0.25)',
    overlayBlue: 'rgba(147, 197, 253, 0.25)',
    overlayOrange: 'rgba(253, 186, 116, 0.15)',

    // Borders
    border: 'rgba(255, 255, 255, 0.6)',
    borderStrong: 'rgba(255, 255, 255, 0.8)',
    borderBlue: 'rgba(59, 130, 246, 0.5)',
    borderOrange: 'rgba(234, 88, 12, 0.5)',
    borderShimmerBlue: 'rgba(180, 210, 255, 0.85)',
    borderShimmerOrange: 'rgba(255, 220, 180, 0.85)',

    // Menu
    menuItemBorder: 'rgba(148, 163, 184, 0.3)',
    menuOverlay: 'rgba(255, 255, 255, 0.28)',
    menuItemPressed: 'rgba(255, 255, 255, 0.15)',

    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.02)',
    shadowMedium: 'rgba(0, 0, 0, 0.06)',

    // Card
    cardBorderWidth: 2,
    cardBoxShadow: '0 2px 5px 2px rgba(0, 0, 0, 0.02)',
    cardHighlight: undefined,

    // Icon
    iconBg: 'rgba(255, 255, 255, 0.5)',
    badgeOverlay: 'rgba(255, 255, 255, 0.5)',

    // Fill
    fill: 'rgba(255, 255, 255, 0.55)',

    // Box shadows
    navBoxShadow: '0 6px 24px 4px rgba(0, 0, 0, 0.08)',
    elevatedBoxShadow: '0 8px 24px 4px rgba(0, 0, 0, 0.12)',

    // Pre-computed styles
    cardWrapperStyle: {
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      boxShadow: '0 2px 5px 2px rgba(0, 0, 0, 0.02)',
    },
    iconContainerStyle: {
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.8)',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    navWrapperStyle: {
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      boxShadow: '0 6px 24px 4px rgba(0, 0, 0, 0.08)',
    },
    menuDropdownStyle: {
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      boxShadow: '0 8px 24px 4px rgba(0, 0, 0, 0.12)',
    },
    pillContainerStyle: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
  };
}
