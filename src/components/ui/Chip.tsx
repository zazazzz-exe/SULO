import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme';
import { radii, space, layout } from '@/theme/tokens';

import { Text } from './Text';
import type { PState } from './pressableState';

type ChipProps = {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  icon?: ReactNode;
  accessibilityLabel?: string;
};

/**
 * Tappable chip for starter prompts, quick-replies, and suggested questions.
 * Selected state used by selector rows (language, reading level).
 */
export function Chip({ label, onPress, selected, icon, accessibilityLabel }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={6}
      style={({ pressed, hovered }: PState) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        minHeight: 40,
        paddingVertical: space.sm,
        paddingHorizontal: space.md,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: selected ? theme.colors.flame : theme.colors.hairline,
        backgroundColor: selected
          ? theme.colors.flameSoft
          : pressed || hovered
            ? theme.colors.inkSoft
            : theme.colors.card,
      })}
    >
      {icon}
      <Text
        variant="small"
        style={{ color: selected ? theme.colors.flameDeep : theme.colors.ink }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Minimum interactive width helper for selector groups. */
export const chipMinTouch = layout.minTouchTarget;
