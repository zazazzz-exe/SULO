/**
 * SULO design tokens — the single source of truth for every color, space,
 * type, radius and shadow value in the app. Components must import from here
 * (or the `theme` helpers) and never hard-code raw values.
 *
 * Mood: warm, calm, editorial-technical — "a torch in the dark." No pure black.
 */

import { Platform, type TextStyle } from 'react-native';

/* ------------------------------------------------------------------ */
/* Color                                                               */
/* ------------------------------------------------------------------ */

export const colors = {
  paper: '#FAF7F1', // app background
  ink: '#17150F', // primary text (warm near-black, never #000)
  flame: '#E07B00', // primary brand / accent (amber torch)
  flameDeep: '#B25E00', // pressed / deeper accent
  blueprint: '#2B5566', // secondary / structural blue-grey

  alert: '#B23A2E', // risk / danger text
  alertBg: '#F7E9E5', // risk / danger surface
  ok: '#4E7A3A', // safe / positive text
  okBg: '#EAF0E3', // safe / positive surface

  muted: '#6E6656', // secondary text, captions, placeholders
  hairline: '#E2DACA', // borders, dividers
  card: '#FFFFFF', // raised surfaces

  // Convenience overlays (derived, kept here so they stay centralized)
  flameSoft: 'rgba(224, 123, 0, 0.12)', // tinted flame fill
  inkSoft: 'rgba(23, 21, 15, 0.06)', // subtle pressed/hover wash
  scrim: 'rgba(23, 21, 15, 0.45)', // modal / sheet backdrop
} as const;

export type ColorToken = keyof typeof colors;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

/**
 * Font family keys map to the names registered in the root layout via
 * @expo-google-fonts. Keep these strings in sync with app/_layout.tsx.
 */
export const fonts = {
  displayBold: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodySemibold: 'Inter_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
} as const;

export type FontToken = keyof typeof fonts;

/**
 * Type scale. Each entry is a ready-to-spread TextStyle so screens stay
 * consistent. Sizes are tuned for an editorial feel with generous leading.
 */
export const type = {
  hero: {
    fontFamily: fonts.displayBold,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: fonts.displayMedium,
    fontSize: 19,
    lineHeight: 26,
  },
  bodyLg: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
  },
  bodyStrong: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    lineHeight: 23,
  },
  small: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  label: {
    // mono uppercase labels / badges / citations
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelSm: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TypeToken = keyof typeof type;

/* ------------------------------------------------------------------ */
/* Spacing — 4 / 8 / 12 / 16 / 24 / 32 / 48                            */
/* ------------------------------------------------------------------ */

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpaceToken = keyof typeof space;

/* ------------------------------------------------------------------ */
/* Radii — sm 8 / md 12 / lg 16                                        */
/* ------------------------------------------------------------------ */

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radii;

/* ------------------------------------------------------------------ */
/* Shadows — cross-platform (RN native + web boxShadow)                */
/* ------------------------------------------------------------------ */

type ShadowToken = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

const makeShadow = (
  y: number,
  blur: number,
  opacity: number,
  elevation: number
): ShadowToken => ({
  shadowColor: colors.ink,
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation,
});

export const shadows = {
  none: makeShadow(0, 0, 0, 0),
  sm: makeShadow(2, 8, 0.06, 2),
  md: makeShadow(6, 18, 0.1, 6),
  lg: makeShadow(14, 36, 0.14, 12),
} as const;

export type ShadowName = keyof typeof shadows;

/**
 * Web reads `boxShadow` better than the RN shadow* props. Use this when a
 * surface should look right in the browser without sacrificing native depth.
 */
export const webShadow = (name: ShadowName): TextStyle | object => {
  if (Platform.OS !== 'web' || name === 'none') return {};
  const map: Record<ShadowName, string> = {
    none: 'none',
    sm: '0 2px 8px rgba(23,21,15,0.06)',
    md: '0 6px 18px rgba(23,21,15,0.10)',
    lg: '0 14px 36px rgba(23,21,15,0.14)',
  };
  return { boxShadow: map[name] };
};

/* ------------------------------------------------------------------ */
/* Layout / responsive breakpoints                                     */
/* ------------------------------------------------------------------ */

export const breakpoints = {
  mobile: 0,
  tablet: 720,
  desktop: 1080,
} as const;

export const layout = {
  threadMaxWidth: 760,
  contentMaxWidth: 1120,
  headerHeight: 60,
  drawerWidth: 300,
  docPanelWidth: 380,
  minTouchTarget: 48,
} as const;

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

export const motion = {
  fast: 180,
  base: 320,
  slow: 520,
  breath: 4200, // torch-glow breathing loop
  stagger: 90,
} as const;

/* ------------------------------------------------------------------ */
/* Aggregate theme object                                              */
/* ------------------------------------------------------------------ */

export const tokens = {
  colors,
  fonts,
  type,
  space,
  radii,
  shadows,
  breakpoints,
  layout,
  motion,
} as const;

export type Tokens = typeof tokens;
