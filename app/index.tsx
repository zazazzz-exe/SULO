import { useRouter } from 'expo-router';
import {
  Camera,
  Upload,
  Mic,
  FileText,
  ShieldAlert,
  Quote,
  Volume2,
  WifiOff,
  Languages,
  Accessibility,
  Type,
  ArrowRight,
} from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Platform, View, type ScrollView } from 'react-native';

import { DocumentPreview } from '@/components/landing/DocumentPreview';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { InfoCard, Section, SectionHeading } from '@/components/landing/parts';
import { CountUp } from '@/components/motion/CountUp';
import { Reveal, RevealScrollView } from '@/components/motion/Reveal';
import { AppShell } from '@/components/nav/AppShell';
import { HOME_TOUR } from '@/components/tour/steps';
import { useTour } from '@/components/tour/TourProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useT, type StringKey } from '@/i18n';
import { useSettings } from '@/services/settingsService';
import { useTheme } from '@/theme';
import { motion, space } from '@/theme/tokens';

type Card = { icon: typeof Camera; titleKey: StringKey; bodyKey: StringKey };

const INPUT_MODES: Card[] = [
  { icon: Camera, titleKey: 'modes.photo', bodyKey: 'modes.photo.body' },
  { icon: Upload, titleKey: 'modes.upload', bodyKey: 'modes.upload.body' },
  { icon: Mic, titleKey: 'modes.voice', bodyKey: 'modes.voice.body' },
];

const FEATURES: Card[] = [
  { icon: FileText, titleKey: 'features.rewrite', bodyKey: 'features.rewrite.body' },
  { icon: ShieldAlert, titleKey: 'features.flags', bodyKey: 'features.flags.body' },
  { icon: Quote, titleKey: 'features.cited', bodyKey: 'features.cited.body' },
  { icon: Volume2, titleKey: 'features.voice', bodyKey: 'features.voice.body' },
  { icon: WifiOff, titleKey: 'features.offline', bodyKey: 'features.offline.body' },
];

const STATS: { to: number; prefix?: string; suffix?: string; labelKey: StringKey }[] = [
  { to: 3, labelKey: 'stats.languages' },
  { to: 100, suffix: '%', labelKey: 'stats.free' },
  { to: 6, labelKey: 'stats.checks' },
  { to: 0, labelKey: 'stats.legalese' },
];

const FOR_EVERYONE: { icon: typeof Languages; labelKey: StringKey }[] = [
  { icon: Languages, labelKey: 'everyone.langs' },
  { icon: Volume2, labelKey: 'everyone.listen' },
  { icon: Type, labelKey: 'everyone.text' },
  { icon: Accessibility, labelKey: 'everyone.reader' },
];

const SHOWCASE_BULLETS: { icon: typeof FileText; key: StringKey }[] = [
  { icon: FileText, key: 'showcase.b1' },
  { icon: ShieldAlert, key: 'showcase.b2' },
  { icon: Quote, key: 'showcase.b3' },
];

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: space.lg,
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

export default function Landing() {
  const theme = useTheme();
  const router = useRouter();
  const { isWide, width } = useResponsive();
  const { t } = useT();
  const { start } = useTour();
  const { settings, ready, update } = useSettings();
  const scrollRef = useRef<ScrollView>(null);
  const howItWorksY = useRef(0);

  const scrollToHow = () => {
    scrollRef.current?.scrollTo({ y: howItWorksY.current, animated: true });
  };

  const startTour = () => start(HOME_TOUR);

  // Auto-start the tour on the very first visit (once layout has settled).
  useEffect(() => {
    if (!ready || settings.tourSeen) return;
    const id = setTimeout(() => {
      update({ tourSeen: true });
      start(HOME_TOUR);
    }, 1000);
    return () => clearTimeout(id);
  }, [ready, settings.tourSeen, start, update]);

  const cardBasis = isWide ? '31%' : '100%';
  const featureBasis = isWide ? (width >= 1080 ? '31%' : '47%') : '100%';

  return (
    <AppShell>
      <RevealScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
        contentContainerStyle={{ paddingBottom: space.xxxl }}
      >
        {/* 1. HERO */}
        <Hero onSeeHow={scrollToHow} onTakeTour={startTour} />

        {/* 2. TRUST LINE */}
        <Section>
          <Container maxWidth={760}>
            <Reveal>
              <Text variant="h2" center color="ink">
                {t('trust.lead')}
                <Text variant="h2" color="flameDeep">
                  {t('trust.emph')}
                </Text>
              </Text>
            </Reveal>
          </Container>
        </Section>

        {/* 2a. STAT BAND — animated count-up */}
        <Section band>
          <Container maxWidth={900}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                gap: space.xl,
              }}
            >
              {STATS.map((s) => (
                <View key={s.labelKey} style={{ alignItems: 'center', gap: space.xs, minWidth: 120 }}>
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                  <Text variant="label" color="muted" center>
                    {t(s.labelKey)}
                  </Text>
                </View>
              ))}
            </View>
          </Container>
        </Section>

        {/* 2b. SHOWCASE — what SULO sees */}
        <Section>
          <Container>
            <View
              style={{
                flexDirection: isWide ? 'row' : 'column-reverse',
                alignItems: 'center',
                gap: space.xxxl,
              }}
            >
              <View style={{ flex: 1, gap: space.lg, minWidth: 280 }}>
                <Reveal>
                  <SectionHeading
                    eyebrow={t('showcase.eyebrow')}
                    title={t('showcase.title')}
                    center={false}
                  />
                </Reveal>
                {SHOWCASE_BULLETS.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <Reveal key={b.key} delay={i * motion.stagger}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: theme.colors.flameSoft,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={20} color={theme.colors.flameDeep} strokeWidth={1.8} />
                        </View>
                        <Text variant="bodyLg" style={{ flex: 1 }}>
                          {t(b.key)}
                        </Text>
                      </View>
                    </Reveal>
                  );
                })}
              </View>

              <Reveal delay={120}>
                <View style={{ alignItems: 'center', paddingVertical: space.lg, paddingRight: space.lg }}>
                  <DocumentPreview width={isWide ? 360 : Math.min(width - 80, 360)} />
                </View>
              </Reveal>
            </View>
          </Container>
        </Section>

        {/* 3. WHAT IT DOES — input modes */}
        <Section band>
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow={t('modes.eyebrow')}
                title={t('modes.title')}
                subtitle={t('modes.subtitle')}
              />
            </Reveal>
            <Grid>
              {INPUT_MODES.map((m, i) => (
                <Reveal key={m.titleKey} delay={i * motion.stagger} style={{ flexBasis: cardBasis, flexGrow: 1 }}>
                  <InfoCard icon={m.icon} title={t(m.titleKey)} body={t(m.bodyKey)} />
                </Reveal>
              ))}
            </Grid>
          </Container>
        </Section>

        {/* 4. HOW IT WORKS */}
        <View
          onLayout={(e) => {
            howItWorksY.current = e.nativeEvent.layout.y;
          }}
        >
          <HowItWorks />
        </View>

        {/* 5. FEATURES */}
        <Section>
          <Container>
            <Reveal>
              <SectionHeading eyebrow={t('features.eyebrow')} title={t('features.title')} />
            </Reveal>
            <Grid>
              {FEATURES.map((f, i) => (
                <Reveal key={f.titleKey} delay={i * motion.stagger} style={{ flexBasis: featureBasis, flexGrow: 1 }}>
                  <InfoCard icon={f.icon} title={t(f.titleKey)} body={t(f.bodyKey)} tone={i % 2 ? 'blueprint' : 'flame'} />
                </Reveal>
              ))}
            </Grid>
          </Container>
        </Section>

        {/* 6. FOR EVERYONE */}
        <Section band>
          <Container maxWidth={820}>
            <Reveal>
              <SectionHeading
                eyebrow={t('everyone.eyebrow')}
                title={t('everyone.title')}
                subtitle={t('everyone.subtitle')}
              />
            </Reveal>
            <Reveal delay={motion.stagger}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: space.md,
                  justifyContent: 'center',
                }}
              >
                {FOR_EVERYONE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Surface
                      key={item.labelKey}
                      pad="md"
                      radius="pill"
                      shadow="none"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: space.sm,
                      }}
                    >
                      <Icon size={18} color={theme.colors.blueprint} strokeWidth={1.8} />
                      <Text variant="bodyStrong">{t(item.labelKey)}</Text>
                    </Surface>
                  );
                })}
              </View>
            </Reveal>
          </Container>
        </Section>

        {/* 7. THE PROMISE */}
        <Section>
          <Container maxWidth={760}>
            <Reveal>
              <Surface pad="xl" radius="lg" shadow="md" style={{ gap: space.lg }}>
                <Badge label={t('promise.badge')} tone="flame" />
                <Text variant="h2">{t('promise.title')}</Text>
                <Text variant="bodyLg" color="muted">
                  {t('promise.body1')}
                  <Text variant="bodyLg" color="ink">PAO</Text>
                  {t('promise.and')}
                  <Text variant="bodyLg" color="ink">DOLE</Text>
                  {t('promise.body2')}
                </Text>
              </Surface>
            </Reveal>
          </Container>
        </Section>

        {/* 8. CTA BAND */}
        <Section band>
          <Container maxWidth={760}>
            <Reveal>
              <View style={{ alignItems: 'center', gap: space.lg }}>
                <Text variant="h1" center>
                  {t('cta.title')}
                </Text>
                <Text variant="bodyLg" color="muted" center style={{ maxWidth: 520 }}>
                  {t('cta.subtitle')}
                </Text>
                <Button
                  label={t('hero.openCoach')}
                  size="lg"
                  onPress={() => router.push('/coach')}
                  iconRight={<ArrowRight size={18} color="#FFFFFF" />}
                />
              </View>
            </Reveal>
          </Container>
        </Section>

        {/* 9. FOOTER */}
        <Container maxWidth={960} style={{ paddingTop: space.xl }}>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.hairline,
              paddingTop: space.xl,
              gap: space.sm,
              flexDirection: isWide ? 'row' : 'column',
              justifyContent: 'space-between',
              alignItems: isWide ? 'center' : 'flex-start',
            }}
          >
            <View style={{ gap: 2 }}>
              <Text variant="bodyStrong">{t('footer.team')}</Text>
              <Text variant="small" color="muted">
                {t('footer.event')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              <Text variant="small" color="muted" onPress={() => router.push('/coach')}>
                {t('nav.coach')}
              </Text>
              <Text variant="small" color="muted" onPress={() => router.push('/glossary')}>
                {t('nav.glossary')}
              </Text>
              <Text variant="small" color="muted" onPress={() => router.push('/settings')}>
                {t('nav.settings')}
              </Text>
            </View>
          </View>
        </Container>
      </RevealScrollView>
    </AppShell>
  );
}
