import { StyleSheet, ViewStyle } from 'react-native';

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

export const glassStyles = StyleSheet.create({
  cardWrapper: {
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden',
  },
  cardWrapperLarge: {
    borderRadius: glassConstants.radius.cardXLarge,
    overflow: 'hidden',
  },
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
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    borderRadius: glassConstants.radius.icon,
    overflow: 'hidden',
  },
  pillContainer: {
    borderRadius: glassConstants.radius.pill,
    overflow: 'hidden',
  },
  navBarWrapper: {
    borderRadius: glassConstants.radius.cardLarge,
    overflow: 'hidden',
  },
  screenGradient: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  screenScrollView: {
    flex: 1,
  },
  screenScrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  formWrapper: {
    borderRadius: glassConstants.radius.card,
    overflow: 'hidden' as const,
    width: '100%' as const,
  },
  formBlur: {
    padding: 12,
    position: 'relative' as const,
  },
  formContent: {
    position: 'relative' as const,
  },
});

export interface ResolvedGlass {
  overlay: string;
  overlayStrong: string;
  overlayBlue: string;
  overlayOrange: string;
  border: string;
  borderStrong: string;
  borderBlue: string;
  borderOrange: string;
  borderShimmerBlue: string;
  borderShimmerOrange: string;
  menuItemBorder: string;
  menuOverlay: string;
  menuItemPressed: string;
  shadow: string;
  shadowMedium: string;
  cardBorderWidth: number;
  cardBoxShadow: string;
  iconBg: string;
  badgeOverlay: string;
  fill: string;
  navBoxShadow: string;
  elevatedBoxShadow: string;
  cardWrapperStyle: ViewStyle;
  iconContainerStyle: ViewStyle;
  navWrapperStyle: ViewStyle;
  pillContainerStyle: ViewStyle;
}

export function getResolvedGlass(isDark: boolean): ResolvedGlass {
  if (isDark) {
    return {
      overlay: 'rgba(40, 40, 45, 0.35)',
      overlayStrong: 'rgba(40, 40, 45, 0.40)',
      overlayBlue: 'rgba(96, 165, 250, 0.15)',
      overlayOrange: 'rgba(251, 146, 60, 0.12)',

      border: 'rgba(255, 255, 255, 0.18)',
      borderStrong: 'rgba(255, 255, 255, 0.22)',
      borderBlue: 'rgba(96, 165, 250, 0.30)',
      borderOrange: 'rgba(251, 146, 60, 0.30)',
      borderShimmerBlue: 'rgba(96, 165, 250, 0.40)',
      borderShimmerOrange: 'rgba(251, 146, 60, 0.40)',

      menuItemBorder: 'rgba(255, 255, 255, 0.08)',
      menuOverlay: 'rgba(30, 30, 35, 0.60)',
      menuItemPressed: 'rgba(255, 255, 255, 0.05)',

      shadow: 'rgba(0, 0, 0, 0.50)',
      shadowMedium: 'rgba(0, 0, 0, 0.60)',

      cardBorderWidth: 0,
      cardBoxShadow: '0 0 0 0 transparent',
      iconBg: 'rgba(255, 255, 255, 0.06)',
      badgeOverlay: 'rgba(0, 0, 0, 0.35)',

      fill: 'rgba(80, 80, 85, 0.15)',

      navBoxShadow: '0 -10px 40px -5px rgba(0, 0, 0, 0.60)',
      elevatedBoxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
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
      pillContainerStyle: {
        borderWidth: 0,
      },
    };
  }

  return {
    overlay: 'rgba(255, 255, 255, 0.35)',
    overlayStrong: 'rgba(255, 255, 255, 0.25)',
    overlayBlue: 'rgba(147, 197, 253, 0.25)',
    overlayOrange: 'rgba(253, 186, 116, 0.15)',

    border: 'rgba(255, 255, 255, 0.6)',
    borderStrong: 'rgba(255, 255, 255, 0.8)',
    borderBlue: 'rgba(59, 130, 246, 0.5)',
    borderOrange: 'rgba(234, 88, 12, 0.5)',
    borderShimmerBlue: 'rgba(180, 210, 255, 0.85)',
    borderShimmerOrange: 'rgba(255, 220, 180, 0.85)',

    menuItemBorder: 'rgba(148, 163, 184, 0.3)',
    menuOverlay: 'rgba(255, 255, 255, 0.28)',
    menuItemPressed: 'rgba(255, 255, 255, 0.15)',

    shadow: 'rgba(0, 0, 0, 0.02)',
    shadowMedium: 'rgba(0, 0, 0, 0.06)',

    cardBorderWidth: 2,
    cardBoxShadow: '0 2px 5px 2px rgba(0, 0, 0, 0.02)',
    iconBg: 'rgba(255, 255, 255, 0.5)',
    badgeOverlay: 'rgba(255, 255, 255, 0.5)',

    fill: 'rgba(255, 255, 255, 0.55)',

    navBoxShadow: '0 6px 24px 4px rgba(0, 0, 0, 0.08)',
    elevatedBoxShadow: '0 8px 24px 4px rgba(0, 0, 0, 0.12)',

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
    pillContainerStyle: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
  };
}
