export { colors } from './colors';
export { spacing, layout } from './spacing';
export { fontSizes, fontWeights, lineHeights, letterSpacing, textStyles } from './typography';
export { borderRadius } from './borderRadius';
export { shadows, createShadow } from './shadows';

import { colors } from './colors';
import { spacing, layout } from './spacing';
import { fontSizes, fontWeights, textStyles } from './typography';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';

export const theme = {
  colors,
  spacing,
  layout,
  fontSizes,
  fontWeights,
  textStyles,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
