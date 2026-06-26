import { useMemo } from 'react';

import { useSettings, textSizeScale } from '@/services/settingsService';

import { colors as baseColors, type, type TypeToken } from './tokens';

export * from './tokens';

/**
 * Derives the active palette from accessibility settings. High-contrast mode
 * darkens secondary text and borders so everything clears WCAG more easily.
 */
function deriveColors(highContrast: boolean) {
  if (!highContrast) return baseColors;
  return {
    ...baseColors,
    muted: '#4A4438',
    hairline: '#B9AE97',
    flame: '#B25E00', // deeper for contrast on paper
  };
}

export type Theme = {
  colors: ReturnType<typeof deriveColors>;
  textScale: number;
  /** Returns a type-scale style with the user's text-size multiplier applied. */
  t: (token: TypeToken) => (typeof type)[TypeToken];
};

/**
 * The themed accessor every component uses. Centralizes high-contrast palette
 * swaps and large-text scaling so screens never re-implement a11y logic.
 */
export function useTheme(): Theme {
  const { settings } = useSettings();
  const textScale = textSizeScale[settings.textSize];

  return useMemo(() => {
    const colors = deriveColors(settings.highContrast);
    const t = (token: TypeToken) => {
      const base = type[token];
      return {
        ...base,
        fontSize: Math.round(base.fontSize * textScale),
        lineHeight: Math.round(base.lineHeight * textScale),
      };
    };
    return { colors, textScale, t };
  }, [settings.highContrast, textScale]);
}
