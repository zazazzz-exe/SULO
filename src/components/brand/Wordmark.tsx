import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';
import { space } from '@/theme/tokens';

/**
 * SULO wordmark: the name with an amber flame "dot" standing in for the torch.
 * The dot sits where the light would be — small, warm, deliberate.
 */
export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const theme = useTheme();
  const fontSize = size === 'lg' ? 34 : size === 'sm' ? 20 : 26;
  const dot = Math.round(fontSize * 0.26);

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}
      accessibilityRole="header"
      accessibilityLabel="SULO"
    >
      <Text
        variant="h1"
        style={{ fontSize, lineHeight: fontSize * 1.05, letterSpacing: 1 }}
      >
        SUL
      </Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text
          variant="h1"
          style={{ fontSize, lineHeight: fontSize * 1.05, letterSpacing: 1 }}
        >
          O
        </Text>
        {/* amber flame dot nested in the O */}
        <View
          style={{
            position: 'absolute',
            width: dot,
            height: dot,
            borderRadius: dot,
            backgroundColor: theme.colors.flame,
          }}
        />
      </View>
    </View>
  );
}
