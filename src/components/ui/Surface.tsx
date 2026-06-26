import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme';
import { radii, space, shadows, webShadow, type ShadowName, type RadiusToken } from '@/theme/tokens';

type SurfaceProps = ViewProps & {
  pad?: keyof typeof space | number;
  radius?: RadiusToken;
  shadow?: ShadowName;
  /** Draw a hairline border (cards on paper read better with one). */
  bordered?: boolean;
  /** Background color token; defaults to card white. */
  tone?: 'card' | 'paper' | 'flameSoft' | 'alertBg' | 'okBg';
};

/**
 * A raised, rounded surface — the base for every card/panel. Uses cross-platform
 * shadow tokens (native shadow* + web boxShadow) so depth looks right on both.
 */
export function Surface({
  pad = 'lg',
  radius = 'md',
  shadow = 'sm',
  bordered = true,
  tone = 'card',
  style,
  ...rest
}: SurfaceProps) {
  const theme = useTheme();
  const padding = typeof pad === 'number' ? pad : space[pad];
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.colors[tone],
          borderRadius: radii[radius],
          padding,
        },
        bordered && { borderWidth: 1, borderColor: theme.colors.hairline },
        shadows[shadow],
        webShadow(shadow),
        style,
      ]}
    />
  );
}
