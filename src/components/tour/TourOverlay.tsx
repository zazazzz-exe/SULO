import { MotiView } from 'moti';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useT } from '@/i18n';
import { useTheme } from '@/theme';
import { motion, radii, space } from '@/theme/tokens';

import { useTour } from './TourProvider';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * The visual spotlight: dims everything except the active target (four dim
 * panels leave a clear "hole"), draws a glowing ring around it, and shows a
 * tooltip with the step copy + Back / Skip / Next. Rendered once at the app root.
 */
export function TourOverlay() {
  const { active, rect, index, steps, next, prev, end } = useTour();
  const theme = useTheme();
  const { t } = useT();
  const reduced = useReducedMotionPref();
  const { width, height } = useWindowDimensions();

  if (!active || !rect) return null;
  const step = steps[index];
  if (!step) return null;

  const pad = 8;
  const hx = Math.max(0, rect.x - pad);
  const hy = Math.max(0, rect.y - pad);
  const hw = rect.width + pad * 2;
  const hh = rect.height + pad * 2;

  const dim = theme.colors.scrim;
  const Panel = ({ s }: { s: object }) => (
    <View pointerEvents="auto" style={[{ position: 'absolute', backgroundColor: dim }, s]} />
  );

  // Tooltip geometry.
  const tipW = Math.min(330, width - space.xl);
  const estTipH = 190;
  const placeBelow = hy + hh + 12 + estTipH < height;
  const tipTop = placeBelow ? hy + hh + 12 : clamp(hy - 12 - estTipH, 12, height - estTipH - 12);
  const tipLeft = clamp(hx + hw / 2 - tipW / 2, space.lg, width - tipW - space.lg);

  const isLast = index === steps.length - 1;

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
      {/* Dim panels around the spotlight hole (capture taps outside) */}
      <Panel s={{ top: 0, left: 0, right: 0, height: hy }} />
      <Panel s={{ top: hy + hh, left: 0, right: 0, bottom: 0 }} />
      <Panel s={{ top: hy, left: 0, width: hx, height: hh }} />
      <Panel s={{ top: hy, left: hx + hw, right: 0, height: hh }} />

      {/* Tap the highlighted area to advance (also blocks the element underneath) */}
      <Pressable
        accessibilityLabel={t('tour.next')}
        onPress={next}
        style={{ position: 'absolute', top: hy, left: hx, width: hw, height: hh }}
      />

      {/* Glowing ring around the target */}
      <MotiView
        animate={{ left: hx, top: hy, width: hw, height: hh }}
        transition={reduced ? { type: 'timing', duration: 0 } : { type: 'timing', duration: motion.base }}
        pointerEvents="none"
        style={{
          position: 'absolute',
          borderRadius: radii.md,
          borderWidth: 2,
          borderColor: theme.colors.flame,
        }}
      />

      {/* Tooltip */}
      <MotiView
        from={{ opacity: 0, translateY: reduced ? 0 : 8 }}
        animate={{ opacity: 1, translateY: 0, left: tipLeft, top: tipTop }}
        transition={{ type: 'timing', duration: reduced ? 0 : motion.base }}
        style={{ position: 'absolute', width: tipW }}
      >
        <Surface pad="lg" radius="lg" shadow="lg" style={{ gap: space.sm }}>
          <Text variant="labelSm" color="flameDeep">
            {t('tour.step', { i: index + 1, n: steps.length })}
          </Text>
          <Text variant="h3">{t(step.titleKey)}</Text>
          <Text variant="body" color="muted">
            {t(step.bodyKey)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: space.xs,
            }}
          >
            <Pressable onPress={end} accessibilityRole="button" hitSlop={8}>
              <Text variant="small" color="muted">
                {t('tour.skip')}
              </Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              {index > 0 ? (
                <Button label={t('tour.back')} variant="secondary" size="sm" onPress={prev} />
              ) : null}
              <Button label={isLast ? t('tour.done') : t('tour.next')} size="sm" onPress={next} />
            </View>
          </View>
        </Surface>
      </MotiView>
    </View>
  );
}
