import { useRouter } from 'expo-router';
import { ArrowRight, ArrowDown } from 'lucide-react-native';
import { MotiView } from 'moti';
import { View } from 'react-native';

import { Embers } from '@/components/brand/Embers';
import { ParallaxGlow } from '@/components/brand/ParallaxGlow';
import { Wordmark } from '@/components/brand/Wordmark';
import { RotatingWord } from '@/components/landing/RotatingWord';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Text } from '@/components/ui/Text';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme';
import { motion, space } from '@/theme/tokens';

/** One staggered, on-load entrance step. */
function Enter({
  index,
  children,
  reduced,
}: {
  index: number;
  children: React.ReactNode;
  reduced: boolean;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: reduced ? 0 : 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: reduced ? 0 : motion.slow,
        delay: reduced ? 0 : index * motion.stagger * 1.4,
      }}
    >
      {children}
    </MotiView>
  );
}

export function Hero({ onSeeHow }: { onSeeHow: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const reduced = useReducedMotionPref();
  const { isWide, width } = useResponsive();

  return (
    <View
      style={{
        overflow: 'hidden',
        paddingTop: isWide ? space.xxxl * 1.6 : space.xxxl,
        paddingBottom: isWide ? space.xxxl * 1.4 : space.xxxl,
      }}
    >
      {/* Signature breathing torch glow (leans toward the pointer on web) */}
      <ParallaxGlow
        size={Math.min(width * 1.1, 720)}
        style={{ top: -120, alignSelf: 'center' }}
      />
      {/* Embers drifting up from the torch */}
      <Embers width={Math.min(width * 0.85, 520)} height={isWide ? 440 : 360} />

      <Container maxWidth={840}>
        <View style={{ alignItems: 'center', gap: space.lg }}>
          <Enter index={0} reduced={reduced}>
            <Wordmark size="lg" />
          </Enter>

          <Enter index={1} reduced={reduced}>
            <Badge label="Literacy, not advice" tone="flame" />
          </Enter>

          <Enter index={2} reduced={reduced}>
            <View style={{ alignItems: 'center' }}>
              <Text
                variant="hero"
                center
                style={{ maxWidth: 760, fontSize: isWide ? 46 : 32, lineHeight: isWide ? 52 : 38 }}
              >
                Understand any legal document — in plain language,
              </Text>
              <RotatingWord
                words={['in English.', 'sa Filipino.', 'sa Cebuano.']}
                textStyle={{ fontSize: isWide ? 46 : 32, lineHeight: isWide ? 52 : 38 }}
                height={isWide ? 52 : 38}
              />
            </View>
          </Enter>

          <Enter index={3} reduced={reduced}>
            <Text variant="bodyLg" color="muted" center style={{ maxWidth: 560 }}>
              SULO is a torch for the fine print. Snap, upload, or speak a contract
              and it explains what each part means, flags what’s risky, and points
              you to free legal help. It teaches — it never pretends to be your lawyer.
            </Text>
          </Enter>

          <Enter index={4} reduced={reduced}>
            <View
              style={{
                flexDirection: isWide ? 'row' : 'column',
                gap: space.md,
                marginTop: space.sm,
                alignItems: 'center',
              }}
            >
              <Button
                label="Open the Coach"
                size="lg"
                onPress={() => router.push('/coach')}
                iconRight={<ArrowRight size={18} color="#FFFFFF" />}
              />
              <Button
                label="See how it works"
                variant="secondary"
                size="lg"
                onPress={onSeeHow}
                iconRight={<ArrowDown size={18} color={theme.colors.ink} />}
              />
            </View>
          </Enter>
        </View>
      </Container>
    </View>
  );
}
