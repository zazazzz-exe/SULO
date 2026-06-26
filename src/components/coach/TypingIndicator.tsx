import { MotiView } from 'moti';
import { View } from 'react-native';

import { FlameMascot } from '@/components/brand/FlameMascot';
import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { space } from '@/theme/tokens';

/**
 * Card type #6 — the typing indicator: a flickering amber flame while SULO
 * composes a reply. Looping opacity/scale; reduced motion shows a steady flame.
 */
export function TypingIndicator() {
  const reduced = useReducedMotionPref();
  const { t } = useT();

  return (
    <View
      accessibilityLabel="SULO is typing"
      accessibilityRole="text"
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.xs }}
    >
      <MotiView
        from={{ opacity: reduced ? 1 : 0.6 }}
        animate={{ opacity: 1 }}
        transition={
          reduced
            ? { type: 'timing', duration: 0 }
            : { type: 'timing', duration: 620, loop: true, repeatReverse: true }
        }
      >
        <FlameMascot size={24} face idle />
      </MotiView>
      <Text variant="small" color="muted">
        {t('card.thinking')}
      </Text>
    </View>
  );
}
