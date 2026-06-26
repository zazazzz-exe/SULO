import { MotiView } from 'moti';
import { View } from 'react-native';

import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import { motion } from '@/theme/tokens';

/**
 * A connecting line between "How it works" steps that fills in when revealed,
 * giving the sequence a sense of progression. Vertical on mobile, horizontal on
 * wide layouts. Reduced motion shows it fully drawn, statically.
 */
export function StepConnector({
  orientation,
  active,
  delay = 0,
}: {
  orientation: 'horizontal' | 'vertical';
  active: boolean;
  delay?: number;
}) {
  const theme = useTheme();
  const reduced = useReducedMotionPref();
  const horizontal = orientation === 'horizontal';
  const grown = active || reduced;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        flex: horizontal ? 1 : undefined,
        height: horizontal ? 2 : 36,
        width: horizontal ? undefined : 2,
        backgroundColor: theme.colors.hairline,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <MotiView
        animate={{
          scaleX: horizontal ? (grown ? 1 : 0) : 1,
          scaleY: horizontal ? 1 : grown ? 1 : 0,
        }}
        transition={
          reduced
            ? { type: 'timing', duration: 0 }
            : { type: 'timing', duration: motion.slow, delay }
        }
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.colors.flame,
          transformOrigin: horizontal ? 'left center' : 'top center',
        }}
      />
    </View>
  );
}
