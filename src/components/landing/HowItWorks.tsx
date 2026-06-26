import { Camera, ShieldAlert, Sparkles, LifeBuoy } from 'lucide-react-native';
import { MotiView } from 'moti';
import { View } from 'react-native';

import { useInViewport } from '@/components/motion/Reveal';
import { Container } from '@/components/ui/Container';
import { Text } from '@/components/ui/Text';
import { StepConnector } from '@/components/motion/StepConnector';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme';
import { motion, radii, space } from '@/theme/tokens';

import { IconTile, Section, SectionHeading } from './parts';

const STEPS = [
  {
    icon: Camera,
    title: 'Capture',
    body: 'Photograph, upload, or speak the document. SULO works with what you have.',
  },
  {
    icon: Sparkles,
    title: 'Understand',
    body: 'Every clause is rewritten in plain language, in English, Filipino, or Cebuano.',
  },
  {
    icon: ShieldAlert,
    title: 'Spot the risks',
    body: 'Terms worth a second look get flagged, with a grounded reason and citation.',
  },
  {
    icon: LifeBuoy,
    title: 'Get real help',
    body: 'When it matters, SULO routes you to free legal aid — PAO and DOLE.',
  },
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
        <Text variant="h3">{s.title}</Text>
        <Text variant="body" color="muted" center={false} style={{ maxWidth: 240 }}>
          {s.body}
        </Text>
      </MotiView>
    );
  };

  return (
    <Section band>
      <Container>
        <View onLayout={onLayout}>
          <SectionHeading
            eyebrow="How it works"
            title="From fine print to clear next step"
          />

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
