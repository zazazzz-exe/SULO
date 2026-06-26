import { useEffect } from 'react';
import { Platform, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useReducedMotionPref } from '@/hooks/useReducedMotion';

import { TorchGlow } from './TorchGlow';

/**
 * Wraps the TorchGlow and, on web, nudges it toward the pointer for a gentle
 * parallax — the light "leans" as you move. Reanimated shared values drive the
 * transform (no per-frame React renders). Static under reduced motion / native.
 */
export function ParallaxGlow({ size, style }: { size?: number; style?: ViewStyle }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (Platform.OS !== 'web' || reduced) return;
    if (typeof window === 'undefined') return;

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      tx.value = withSpring(((e.clientX - cx) / cx) * 26, { damping: 22, stiffness: 90 });
      ty.value = withSpring(((e.clientY - cy) / cy) * 20, { damping: 22, stiffness: 90 });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduced, tx, ty]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { pointerEvents: 'none' }]}>
      <TorchGlow size={size} style={style} />
    </Animated.View>
  );
}
