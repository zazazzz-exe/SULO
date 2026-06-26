import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/theme';
import { colors, type TypeToken } from '@/theme/tokens';

type TextProps = RNTextProps & {
  /** Type-scale token (applies font, size, leading + user text-size scaling). */
  variant?: TypeToken;
  /** Color token name; defaults to ink. */
  color?: keyof typeof colors;
  center?: boolean;
};

/**
 * The only Text used across SULO. Applies the type scale, the active palette,
 * and the large-text accessibility multiplier. Never style raw <Text> elsewhere.
 */
export function Text({
  variant = 'body',
  color = 'ink',
  center,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  return (
    <RNText
      {...rest}
      style={[
        theme.t(variant),
        { color: theme.colors[color] },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}
