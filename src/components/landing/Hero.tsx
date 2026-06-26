import { useRouter } from 'expo-router';
import { ArrowRight, ArrowDown } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Pressable, View } from 'react-native';

import { Embers } from '@/components/brand/Embers';
import { ParallaxGlow } from '@/components/brand/ParallaxGlow';
import { Wordmark } from '@/components/brand/Wordmark';
import { RotatingWord } from '@/components/landing/RotatingWord';
import { TourSpot } from '@/components/tour/TourSpot';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Text } from '@/components/ui/Text';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useResponsive } from '@/hooks/useResponsive';
import { useT } from '@/i18n';
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

export function Hero({ onSeeHow, onTakeTour }: { onSeeHow: () => void; onTakeTour: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const reduced = useReducedMotionPref();
  const { isWide, width } = useResponsive();
  const { t } = useT();

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
            <Badge label={t('hero.badge')} tone="flame" />
          </Enter>

          <Enter index={2} reduced={reduced}>
            <View style={{ alignItems: 'center' }}>
              <Text
                variant="hero"
                center
                style={{ maxWidth: 760, fontSize: isWide ? 46 : 32, lineHeight: isWide ? 52 : 38 }}
              >
                {t('hero.headline')}
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
              {t('hero.subtext')}
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
              <TourSpot id="coach">
                <Button
                  label={t('hero.openCoach')}
                  size="lg"
                  onPress={() => router.push('/coach')}
                  iconRight={<ArrowRight size={18} color="#FFFFFF" />}
                />
              </TourSpot>
              <TourSpot id="how">
                <Button
                  label={t('hero.seeHow')}
                  variant="secondary"
                  size="lg"
                  onPress={onSeeHow}
                  iconRight={<ArrowDown size={18} color={theme.colors.ink} />}
                />
              </TourSpot>
            </View>
          </Enter>

          <Enter index={5} reduced={reduced}>
            <Pressable onPress={onTakeTour} accessibilityRole="button" hitSlop={8}>
              <Text variant="small" color="muted" style={{ textDecorationLine: 'underline' }}>
                {t('tour.start')}
              </Text>
            </Pressable>
          </Enter>
        </View>
      </Container>
    </View>
  );
}
