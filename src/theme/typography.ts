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
  bold: '700' as const,
  extrabold: '800' as const,
};

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
    fontWeight: fontWeights.extrabold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 38,
  },
  h1: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 32,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 28,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: 28,
  },
  h4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  },
  body: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 18,
  },
  labelSmall: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.24,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
} as const;
