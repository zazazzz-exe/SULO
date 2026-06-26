import { MotiView } from 'moti';
import { View } from 'react-native';

import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { colors } from '@/theme/tokens';

/**
 * Floating embers that drift up from the torch glow — the hero "comes alive."
 * Pure Moti loops, deterministic per-index (no layout jitter), and fully off
 * under reduced motion. Decorative + non-interactive.
 */

// Small deterministic pseudo-random so positions/timings are stable across renders.
const rand = (i: number, salt: number) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function Embers({
  count = 14,
  width = 320,
  height = 360,
}: {
  count?: number;
  width?: number;
  height?: number;
}) {
  const reduced = useReducedMotionPref();
  if (reduced) return null;

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={{
        position: 'absolute',
        width,
        height,
        alignSelf: 'center',
        bottom: 0,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const startX = rand(i, 1) * width;
        const drift = (rand(i, 2) - 0.5) * 70;
        const size = 3 + rand(i, 3) * 5;
        const duration = 3400 + rand(i, 4) * 3200;
        const delay = rand(i, 5) * 3500;
        const rise = height * (0.6 + rand(i, 6) * 0.4);
        const warm = rand(i, 7) > 0.5 ? colors.flame : '#FFC061';

        return (
          <MotiView
            key={i}
            from={{ opacity: 0, translateY: 0, translateX: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.85, 0.85, 0],
              translateY: -rise,
              translateX: drift,
              scale: [0.5, 1, 0.9, 0.3],
            }}
            transition={{
              type: 'timing',
              duration,
              delay,
              loop: true,
              repeatReverse: false,
            }}
            style={{
              position: 'absolute',
              left: startX,
              bottom: 0,
              width: size,
              height: size,
              borderRadius: size,
              backgroundColor: warm,
            }}
          />
        );
      })}
    </View>
  );
}
