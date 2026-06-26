import { useEffect, useRef, useState } from 'react';

import { Text } from '@/components/ui/Text';
import { useInViewport } from '@/components/motion/Reveal';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import type { TypeToken } from '@/theme/tokens';
import { View } from 'react-native';

/**
 * Counts up from 0 to `to` the first time it scrolls into view (eased), then
 * holds. Snaps straight to the value under reduced motion. Used for the landing
 * stat band.
 */
export function CountUp({
  to,
  duration = 1300,
  prefix = '',
  suffix = '',
  variant = 'hero',
  color = 'flameDeep',
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  variant?: TypeToken;
  color?: 'flameDeep' | 'ink' | 'blueprint';
}) {
  const { onLayout, visible } = useInViewport();
  const reduced = useReducedMotionPref();
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;

    if (reduced) {
      setValue(to);
      return;
    }

    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * to));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [visible, reduced, to, duration]);

  return (
    <View onLayout={onLayout}>
      <Text variant={variant} color={color} center>
        {prefix}
        {value}
        {suffix}
      </Text>
    </View>
  );
}
