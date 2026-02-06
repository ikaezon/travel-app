import { StyleSheet } from 'react-native';

/**
 * Liquid Glass Design System
 * 
 * Centralized styling for the liquid glass effect used throughout the app.
 * Based on QuickActionCard styling for consistency.
 */

// ============================================
// CONSTANTS
// ============================================

export const glassConstants = {
  // Blur intensity levels
  blur: {
    card: 24,        // Main card blur
    icon: 50,        // Icon container blur (stronger)
    nav: 24,         // Navigation bar blur
    menu: 48,        // Dropdown menus (stronger blur)
  },

  // Border radius values
  radius: {
    card: 28,        // Main card (1.75rem)
    cardLarge: 32,   // Large card/nav bar (2rem)
    cardXLarge: 40,  // Extra large (2.5rem) - TripCard
    icon: 16,        // Icon containers (1rem)
    pill: 9999,      // Full pill shape
  },
  // Inner radius (radius minus border) - BlurView needs this to clip properly with thin borders
  radiusInner: {
    card: 26,        // 28 - 2
    cardLarge: 30,   // 32 - 2
    cardXLarge: 38,  // 40 - 2
    icon: 14,        // 16 - 2
  },

  // Border widths
  borderWidth: {
    card: 2,         // Standard card border
    cardThin: 1,     // Thin variant
    icon: 1.5,       // Icon container border
    iconThin: 0.5,   // Thin icon border
  },
} as const;

// ============================================
// COLORS
// ============================================

export const glassColors = {
  // Card overlay (white tint on top of blur)
  overlay: 'rgba(255, 255, 255, 0.35)',
  overlayStrong: 'rgba(255, 255, 255, 0.25)',
  
  // Tinted overlays for action buttons
  overlayBlue: 'rgba(147, 197, 253, 0.25)',   // Blue tint - Boarding Pass
  overlayOrange: 'rgba(253, 186, 116, 0.15)', // Orange tint - Get Directions
  borderBlue: 'rgba(59, 130, 246, 0.5)',
  borderOrange: 'rgba(234, 88, 12, 0.5)',
  // Shimmer borders (white glossy edge effect, tinted) - matches glass cards' borderStrong
  borderShimmerBlue: 'rgba(180, 210, 255, 0.85)',
  borderShimmerOrange: 'rgba(255, 220, 180, 0.85)',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.6)',
  borderStrong: 'rgba(255, 255, 255, 0.8)',
  menuItemBorder: 'rgba(148, 163, 184, 0.3)',
  
  // Menu-specific
  menuOverlay: 'rgba(255, 255, 255, 0.28)',  // Less transparent for clearer background
  menuItemPressed: 'rgba(255, 255, 255, 0.15)',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.02)',
  shadowMedium: 'rgba(0, 0, 0, 0.06)',
} as const;

// ============================================
// BOX SHADOWS
// ============================================

export const glassShadows = {
  // Card shadow - subtle depth
  card: '0 2px 5px 2px rgba(0, 0, 0, 0.02)',
  
  // Nav bar shadow
  nav: '0 6px 24px 4px rgba(0, 0, 0, 0.08)',
  
  // Icon container shadow
  icon: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
  
  // Elevated elements (FAB, menus)
  elevated: '0 8px 24px 4px rgba(0, 0, 0, 0.12)',
} as const;

// ============================================
// REUSABLE STYLE OBJECTS
// ============================================

export const glassStyles = StyleSheet.create({
  /**
   * Card wrapper - the outer container with border and shadow
   * Use on the Pressable/View that wraps the BlurView
   */
  cardWrapper: {
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.card,
    borderColor: glassColors.border,
    boxShadow: glassShadows.card,
  },

  /**
   * Large card wrapper (for TripCard)
   */
  cardWrapperLarge: {
    borderRadius: glassConstants.radius.cardXLarge,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.card,
    borderColor: glassColors.border,
    boxShadow: glassShadows.card,
  },

  /**
   * BlurView content - borderRadius + overflow: 'hidden' clips the blur to rounded corners.
   * Required to prevent rectangular blur from showing through with thin borders.
   */
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

  /**
   * Card overlay - the white tint layer inside BlurView
   * Apply with absoluteFillObject
   */
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: glassColors.overlay,
  },

  /**
   * Icon container styling
   */
  iconContainer: {
    borderRadius: glassConstants.radius.icon,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.icon,
    borderColor: glassColors.borderStrong,
  },

  /**
   * Pill button/badge container
   */
  pillContainer: {
    borderRadius: glassConstants.radius.pill,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.cardThin,
    borderColor: glassColors.border,
  },

  /**
   * Nav bar wrapper
   */
  navBarWrapper: {
    borderRadius: glassConstants.radius.cardLarge,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.card,
    borderColor: glassColors.border,
    boxShadow: glassShadows.nav,
  },

  /**
   * Dropdown menu - shared base for Add/Delete menus
   */
  menuDropdown: {
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
    borderWidth: glassConstants.borderWidth.card,
    borderColor: glassColors.border,
    boxShadow: glassShadows.elevated,
    minWidth: 160,
  },

  /**
   * Blur fill layer for dropdown menus (absolutely positioned)
   */
  menuBlurFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  /**
   * Overlay fill layer for dropdown menus (absolutely positioned)
   */
  menuOverlayFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: glassColors.menuOverlay,
  },

  /**
   * Menu item row - shared layout for Add/Delete menu items
   */
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  /**
   * Menu item pressed state
   */
  menuItemPressed: {
    backgroundColor: glassColors.menuItemPressed,
  },

  /**
   * Border between menu items (for multi-item menus)
   */
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glassColors.menuItemBorder,
  },
});

// ============================================
// HELPER: Thin border variant (for dashboard)
// ============================================

export const glassThinBorderStyles = StyleSheet.create({
  cardWrapper: {
    ...glassStyles.cardWrapper,
    borderWidth: glassConstants.borderWidth.cardThin,
  },
  iconContainer: {
    ...glassStyles.iconContainer,
    borderWidth: glassConstants.borderWidth.iconThin,
  },
});

// ============================================
// THEME-AWARE GLASS COLORS
// ============================================

export interface ResolvedGlassColors {
  overlay: string;
  overlayStrong: string;
  overlayBlue: string;
  overlayOrange: string;
  borderBlue: string;
  borderOrange: string;
  borderShimmerBlue: string;
  borderShimmerOrange: string;
  border: string;
  borderStrong: string;
  menuItemBorder: string;
  menuOverlay: string;
  menuItemPressed: string;
  shadow: string;
  shadowMedium: string;
  /** Top-edge highlight for liquid glass cards */
  cardHighlightTop?: string;
}

export function getGlassColors(isDark: boolean): ResolvedGlassColors {
  if (isDark) {
    // Obsidian Liquid Glass palette
    return {
      overlay: 'rgba(80, 80, 85, 0.15)',
      overlayStrong: 'rgba(40, 40, 45, 0.40)',
      overlayBlue: 'rgba(96, 165, 250, 0.15)',
      overlayOrange: 'rgba(251, 146, 60, 0.12)',
      borderBlue: 'rgba(96, 165, 250, 0.30)',
      borderOrange: 'rgba(251, 146, 60, 0.30)',
      borderShimmerBlue: 'rgba(96, 165, 250, 0.40)',
      borderShimmerOrange: 'rgba(251, 146, 60, 0.40)',
      border: 'rgba(255, 255, 255, 0.18)',
      borderStrong: 'rgba(255, 255, 255, 0.22)',
      menuItemBorder: 'rgba(255, 255, 255, 0.08)',
      menuOverlay: 'rgba(30, 30, 35, 0.60)',
      menuItemPressed: 'rgba(255, 255, 255, 0.05)',
      shadow: 'rgba(0, 0, 0, 0.50)',
      shadowMedium: 'rgba(0, 0, 0, 0.60)',
      cardHighlightTop: 'rgba(255, 255, 255, 0.10)',
    };
  }

  return {
    overlay: glassColors.overlay,
    overlayStrong: glassColors.overlayStrong,
    overlayBlue: glassColors.overlayBlue,
    overlayOrange: glassColors.overlayOrange,
    borderBlue: glassColors.borderBlue,
    borderOrange: glassColors.borderOrange,
    borderShimmerBlue: glassColors.borderShimmerBlue,
    borderShimmerOrange: glassColors.borderShimmerOrange,
    border: glassColors.border,
    borderStrong: glassColors.borderStrong,
    menuItemBorder: glassColors.menuItemBorder,
    menuOverlay: glassColors.menuOverlay,
    menuItemPressed: glassColors.menuItemPressed,
    shadow: glassColors.shadow,
    shadowMedium: glassColors.shadowMedium,
  };
}

// ============================================
// THEME-AWARE GLASS SHADOWS
// ============================================

export interface CardShadowNative {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ResolvedGlassShadows {
  card: string;
  nav: string;
  icon: string;
  elevated: string;
  cardShadowNative?: CardShadowNative;
}

export function getGlassShadows(isDark: boolean): ResolvedGlassShadows {
  if (isDark) {
    return {
      card: '0 20px 40px -10px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
      nav: '0 -10px 40px -5px rgba(0, 0, 0, 0.60)',
      icon: 'inset 0 0 15px rgba(255, 255, 255, 0.05)',
      elevated: '0 20px 40px -10px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
      cardShadowNative: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
        elevation: 24,
      },
    };
  }

  return {
    card: glassShadows.card,
    nav: glassShadows.nav,
    icon: glassShadows.icon,
    elevated: glassShadows.elevated,
  };
}
