import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { space, layout } from '@/theme/tokens';

/**
 * Centers content with a max width and responsive horizontal padding, so the
 * same page reads well on phone, tablet, and desktop.
 */
export function Container({
  children,
  maxWidth = layout.contentMaxWidth,
  style,
}: {
  children: ReactNode;
  maxWidth?: number;
  style?: ViewStyle;
}) {
  const { isWide, isDesktop } = useResponsive();
  return (
    <View
      style={[
        {
          width: '100%',
          maxWidth,
          alignSelf: 'center',
          paddingHorizontal: isDesktop ? space.xxxl : isWide ? space.xl : space.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
