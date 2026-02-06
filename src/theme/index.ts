export { colors, getThemeColors } from './colors';
export type { ResolvedColors } from './colors';
export { spacing, layout } from './spacing';
export { fontSizes, fontWeights, fontFamilies, lineHeights, letterSpacing, textStyles } from './typography';
export { borderRadius } from './borderRadius';
export { shadows, createShadow } from './shadows';
export { glassStyles, glassConstants, glassColors, glassShadows, glassThinBorderStyles, getGlassColors, getGlassShadows } from './glassStyles';
export type { ResolvedGlassColors, ResolvedGlassShadows } from './glassStyles';

import { colors } from './colors';
import { spacing, layout } from './spacing';
import { fontSizes, fontWeights, fontFamilies, textStyles } from './typography';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';
import { glassStyles, glassConstants, glassColors, glassShadows } from './glassStyles';

export const theme = {
  colors,
  spacing,
  layout,
  fontSizes,
  fontWeights,
  fontFamilies,
  textStyles,
  borderRadius,
  shadows,
  glass: {
    styles: glassStyles,
    constants: glassConstants,
    colors: glassColors,
    shadows: glassShadows,
  },
} as const;

export type Theme = typeof theme;
