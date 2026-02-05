export const fontSizes = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
  xxxl: 24,
  display: 28,
  hero: 32,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '600' as const,
  extrabold: '700' as const,
};

export const fontFamilies = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_600SemiBold',
  extrabold: 'Outfit_700Bold',
} as const;

export const lineHeights = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

export const textStyles = {
  hero: {
    fontSize: fontSizes.hero,
    fontFamily: fontFamilies.extrabold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 38,
  },
  h1: {
    fontSize: fontSizes.display,
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 32,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 28,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontFamily: fontFamilies.bold,
    lineHeight: 28,
  },
  h4: {
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  bodyLarge: {
    fontSize: fontSizes.md,
    fontFamily: fontFamilies.regular,
    lineHeight: 24,
  },
  body: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.regular,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.regular,
    lineHeight: 16,
  },
  label: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.medium,
    lineHeight: 18,
  },
  labelSmall: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.semibold,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: fontSizes.md,
    fontFamily: fontFamilies.bold,
    letterSpacing: 0.24,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.bold,
  },
} as const;
