import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { useTheme } from '@/theme';
import { radii, space, layout, webShadow } from '@/theme/tokens';

import { Text } from './Text';
import type { PState } from './pressableState';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
};

const sizing: Record<Size, { padV: number; padH: number; font: 'small' | 'bodyStrong' }> = {
  sm: { padV: space.sm, padH: space.md, font: 'small' },
  md: { padV: space.md, padH: space.lg, font: 'bodyStrong' },
  lg: { padV: space.lg, padH: space.xl, font: 'bodyStrong' },
};

/**
 * Primary action control. Icons are always paired with a text label (a11y),
 * touch target is >= 48dp, and press/hover states give clear feedback.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const s = sizing[size];

  const palette = (pressed: boolean, hovered: boolean) => {
    switch (variant) {
      case 'primary':
        return {
          bg: pressed ? theme.colors.flameDeep : theme.colors.flame,
          fg: '#FFFFFF' as const,
          border: 'transparent',
          lift: hovered,
        };
      case 'danger':
        return {
          bg: pressed ? '#8F2D23' : theme.colors.alert,
          fg: '#FFFFFF' as const,
          border: 'transparent',
          lift: hovered,
        };
      case 'secondary':
        return {
          bg: pressed ? theme.colors.inkSoft : 'transparent',
          fg: theme.colors.ink,
          border: theme.colors.hairline,
          lift: false,
        };
      case 'ghost':
      default:
        return {
          bg: pressed ? theme.colors.inkSoft : 'transparent',
          fg: theme.colors.flameDeep,
          border: 'transparent',
          lift: false,
        };
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...rest}
      style={({ pressed, hovered }: PState) => {
        const p = palette(pressed, !!hovered);
        return [
          {
            minHeight: layout.minTouchTarget,
            paddingVertical: s.padV,
            paddingHorizontal: s.padH,
            borderRadius: radii.pill,
            backgroundColor: p.bg,
            borderWidth: 1,
            borderColor: p.border,
            opacity: disabled ? 0.5 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space.sm,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
          },
          p.lift && webShadow('md'),
        ];
      }}
    >
      {({ pressed }) => {
        const p = palette(pressed, false);
        return (
          <>
            {icon ? <View accessibilityElementsHidden>{icon}</View> : null}
            <Text variant={s.font} style={{ color: p.fg }}>
              {label}
            </Text>
            {iconRight ? <View accessibilityElementsHidden>{iconRight}</View> : null}
          </>
        );
      }}
    </Pressable>
  );
}
