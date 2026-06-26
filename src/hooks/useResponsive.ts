import { useWindowDimensions } from 'react-native';

import { breakpoints, layout } from '@/theme/tokens';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export type Responsive = {
  width: number;
  height: number;
  bp: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** true on tablet or wider — used to switch panel/sheet layouts */
  isWide: boolean;
  contentMaxWidth: number;
};

/**
 * Single responsive source of truth, driven by useWindowDimensions so the
 * SAME component code adapts on web, tablet and phone (no platform forks).
 */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();

  const bp: Breakpoint =
    width >= breakpoints.desktop
      ? 'desktop'
      : width >= breakpoints.tablet
        ? 'tablet'
        : 'mobile';

  return {
    width,
    height,
    bp,
    isMobile: bp === 'mobile',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    isWide: bp !== 'mobile',
    contentMaxWidth: Math.min(width, layout.contentMaxWidth),
  };
}
