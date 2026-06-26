import { Camera, ShieldAlert, Sparkles, LifeBuoy } from 'lucide-react-native';
import { MotiView } from 'moti';
import { View } from 'react-native';

import { useInViewport } from '@/components/motion/Reveal';
import { Container } from '@/components/ui/Container';
import { Text } from '@/components/ui/Text';
import { StepConnector } from '@/components/motion/StepConnector';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useResponsive } from '@/hooks/useResponsive';
import { useT, type StringKey } from '@/i18n';
import { useTheme } from '@/theme';
import { motion, radii, space } from '@/theme/tokens';

import { IconTile, Section, SectionHeading } from './parts';

const STEPS: { icon: typeof Camera; titleKey: StringKey; bodyKey: StringKey }[] = [
  { icon: Camera, titleKey: 'how.capture', bodyKey: 'how.capture.body' },
  { icon: Sparkles, titleKey: 'how.understand', bodyKey: 'how.understand.body' },
  { icon: ShieldAlert, titleKey: 'how.risks', bodyKey: 'how.risks.body' },
  { icon: LifeBuoy, titleKey: 'how.help', bodyKey: 'how.help.body' },
];

/**
 * Sequenced "How it works" with an animated connecting line that draws between
 * steps as the section enters view. Horizontal on wide screens, vertical on
 * mobile. Reduced motion shows everything settled.
 */
export function HowItWorks() {
  const theme = useTheme();
  const reduced = useReducedMotionPref();
  const { isWide } = useResponsive();
  const { onLayout, visible } = useInViewport();
  const { t } = useT();

  const StepCard = ({ index }: { index: number }) => {
    const s = STEPS[index];
    return (
      <MotiView
        animate={{
          opacity: visible ? 1 : 0,
          translateY: visible || reduced ? 0 : 24,
        }}
        transition={{
          type: 'timing',
          duration: reduced ? 0 : motion.base,
          delay: reduced ? 0 : index * motion.stagger * 2,
        }}
        style={{
          flex: isWide ? 1 : undefined,
          alignItems: isWide ? 'center' : 'flex-start',
          gap: space.sm,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
          }}
        >
          <IconTile icon={s.icon} />
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: radii.pill,
              backgroundColor: theme.colors.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="labelSm" style={{ color: theme.colors.paper }}>
              {String(index + 1)}
            </Text>
          </View>
        </View>
        <Text variant="h3">{t(s.titleKey)}</Text>
        <Text variant="body" color="muted" center={false} style={{ maxWidth: 240 }}>
          {t(s.bodyKey)}
        </Text>
      </MotiView>
    );
  };

  return (
    <Section band>
      <Container>
        <View onLayout={onLayout}>
          <SectionHeading eyebrow={t('how.eyebrow')} title={t('how.title')} />

          {isWide ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                >
                  <StepCard index={i} />
                  {i < STEPS.length - 1 ? (
                    <View style={{ width: 48, paddingTop: 22 }}>
                      <StepConnector
                        orientation="horizontal"
                        active={visible}
                        delay={i * motion.stagger * 2 + 150}
                      />
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={{ gap: space.lg }}>
              {STEPS.map((_, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: space.lg }}>
                  <View style={{ alignItems: 'center', width: 26 }}>
                    {i < STEPS.length - 1 ? (
                      <View style={{ position: 'absolute', top: 30 }}>
                        <StepConnector
                          orientation="vertical"
                          active={visible}
                          delay={i * motion.stagger * 2 + 150}
                        />
                      </View>
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <StepCard index={i} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </Container>
    </Section>
  );
}
