import { MotiView } from 'moti';
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { colors } from '@/theme/tokens';

/**
 * SULO's flame mascot — a friendly torch flame. Used as the Coach assistant
 * avatar (`face`), the empty-state hero, and a decorative mark. Gently breathes
 * and sways when idle; sits still under reduced motion.
 */
export function FlameMascot({
  size = 40,
  face = false,
  idle = true,
}: {
  size?: number;
  /** Show eyes (use for the assistant avatar / mascot moments). */
  face?: boolean;
  /** Idle breathing/sway animation. */
  idle?: boolean;
}) {
  const reduced = useReducedMotionPref();
  const animate = idle && !reduced;

  return (
    <MotiView
      from={{ scale: 1, rotateZ: '0deg' }}
      animate={{ scale: animate ? 1.05 : 1, rotateZ: animate ? '2deg' : '0deg' }}
      transition={
        animate
          ? { type: 'timing', duration: 1700, loop: true, repeatReverse: true }
          : { type: 'timing', duration: 0 }
      }
    >
      <Svg width={size} height={size * 1.18} viewBox="0 0 100 118" fill="none">
        <Defs>
          <LinearGradient id="flameBody" x1="50" y1="2" x2="50" y2="118" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFD9A0" />
            <Stop offset="0.4" stopColor={colors.flame} />
            <Stop offset="1" stopColor={colors.flameDeep} />
          </LinearGradient>
          <LinearGradient id="flameCore" x1="50" y1="40" x2="50" y2="116" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFF2D6" />
            <Stop offset="1" stopColor="#FFC061" />
          </LinearGradient>
        </Defs>

        {/* Outer flame */}
        <Path
          d="M50 2C50 2 16 30 16 66C16 92 31 116 50 116C69 116 84 92 84 66C84 52 74 40 68 48C70 28 50 2 50 2Z"
          fill="url(#flameBody)"
        />
        {/* Inner core */}
        <Path
          d="M50 116C37 116 28 96 32 74C38 92 47 84 47 70C47 58 55 50 55 50C55 50 70 66 70 86C70 104 61 116 50 116Z"
          fill="url(#flameCore)"
          opacity={0.92}
        />

        {face ? (
          <>
            {/* Eyes */}
            <Ellipse cx="42" cy="78" rx="4.4" ry="6" fill={colors.ink} />
            <Ellipse cx="58" cy="78" rx="4.4" ry="6" fill={colors.ink} />
            {/* Catchlights */}
            <Ellipse cx="43.4" cy="75.6" rx="1.5" ry="1.8" fill="#FFFFFF" />
            <Ellipse cx="59.4" cy="75.6" rx="1.5" ry="1.8" fill="#FFFFFF" />
          </>
        ) : null}
      </Svg>
    </MotiView>
  );
}
