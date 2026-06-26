import { MotiView } from 'moti';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import { motion, radii, space, webShadow } from '@/theme/tokens';
import type { RiskLevel } from '@/services/types';

/**
 * A faux "scanned contract" built entirely from primitives — no image asset, no
 * copyright risk. Text is rendered as bars; two clauses are highlighted the way
 * SULO would flag them, with floating risk tags. Used in the landing showcase
 * and as a thumbnail. Highlights gently pulse (off under reduced motion).
 */

/** A single line of faux body text. */
function Line({ w, color }: { w: number | string; color: string }) {
  return (
    <View style={{ height: 7, width: w as number, borderRadius: 4, backgroundColor: color }} />
  );
}

function RiskTag({ level }: { level: RiskLevel }) {
  const theme = useTheme();
  const reduced = useReducedMotionPref();
  const danger = level !== 'LOW';
  return (
    <MotiView
      from={{ opacity: 0, translateX: reduced ? 0 : 14, scale: 0.9 }}
      animate={{ opacity: 1, translateX: 0, scale: 1 }}
      transition={{ type: 'timing', duration: reduced ? 0 : motion.slow, delay: reduced ? 0 : 600 }}
      style={[
        {
          position: 'absolute',
          top: -6,
          right: -14,
          paddingVertical: 4,
          paddingHorizontal: space.sm,
          borderRadius: radii.pill,
          backgroundColor: danger ? theme.colors.alert : theme.colors.ok,
        },
        webShadow('md'),
      ]}
    >
      <Text variant="labelSm" style={{ color: '#FFFFFF' }}>
        {level} RISK
      </Text>
    </MotiView>
  );
}

/** A clause block: a heading bar + body lines, optionally highlighted. */
function Clause({
  heading,
  lines,
  highlight,
  tag,
}: {
  heading: string;
  lines: (number | string)[];
  highlight?: 'risk' | 'med';
  tag?: RiskLevel;
}) {
  const theme = useTheme();
  const reduced = useReducedMotionPref();
  const bg =
    highlight === 'risk'
      ? theme.colors.alertBg
      : highlight === 'med'
        ? theme.colors.flameSoft
        : 'transparent';
  const barColor = theme.colors.hairline;

  const inner = (
    <View
      style={{
        gap: space.sm,
        padding: highlight ? space.sm : 0,
        borderRadius: radii.sm,
        backgroundColor: bg,
        borderLeftWidth: highlight ? 3 : 0,
        borderLeftColor: highlight === 'risk' ? theme.colors.alert : theme.colors.flame,
      }}
    >
      {tag ? <RiskTag level={tag} /> : null}
      <Text variant="labelSm" color={highlight === 'risk' ? 'alert' : 'muted'}>
        {heading}
      </Text>
      {lines.map((w, i) => (
        <Line key={i} w={w} color={barColor} />
      ))}
    </View>
  );

  if (!highlight) return inner;

  // Pulse highlighted clauses to draw the eye.
  return (
    <MotiView
      from={{ opacity: 0.85 }}
      animate={{ opacity: reduced ? 1 : [0.85, 1, 0.85] }}
      transition={
        reduced
          ? { type: 'timing', duration: 0 }
          : { type: 'timing', duration: 2600, loop: true, repeatReverse: false }
      }
    >
      {inner}
    </MotiView>
  );
}

export function DocumentPreview({ width = 340 }: { width?: number }) {
  const theme = useTheme();
  const reduced = useReducedMotionPref();

  return (
    <MotiView
      from={{ opacity: 0, rotateZ: reduced ? '0deg' : '-3deg', translateY: reduced ? 0 : 20 }}
      animate={{ opacity: 1, rotateZ: reduced ? '0deg' : '-2deg', translateY: 0 }}
      transition={{ type: 'timing', duration: reduced ? 0 : motion.slow }}
      style={[
        {
          width,
          backgroundColor: theme.colors.card,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: theme.colors.hairline,
          padding: space.xl,
          gap: space.lg,
        },
        webShadow('lg'),
      ]}
    >
      {/* Header */}
      <View style={{ gap: space.xs, alignItems: 'center', marginBottom: space.xs }}>
        <Text variant="label" color="muted">
          Employment Contract
        </Text>
        <View style={{ height: 9, width: '70%', borderRadius: 4, backgroundColor: theme.colors.ink }} />
        <View style={{ height: 6, width: '45%', borderRadius: 4, backgroundColor: theme.colors.hairline }} />
      </View>

      <View style={{ height: 1, backgroundColor: theme.colors.hairline }} />

      <Clause heading="1 · Compensation" lines={['90%', '76%', '60%']} />
      <Clause heading="2 · Probationary Period" lines={['88%', '64%']} highlight="risk" tag="HIGH" />
      <Clause heading="3 · Hours & Overtime" lines={['92%', '80%', '52%']} highlight="risk" tag="HIGH" />
      <Clause heading="4 · Confidentiality" lines={['84%', '70%']} />
      <Clause heading="5 · Non-Competition" lines={['86%', '58%']} highlight="med" tag="MED" />
    </MotiView>
  );
}
