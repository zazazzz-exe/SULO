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
import { useRef } from 'react';
import { Platform, View, type ScrollView } from 'react-native';

import { DocumentPreview } from '@/components/landing/DocumentPreview';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { InfoCard, Section, SectionHeading } from '@/components/landing/parts';
import { CountUp } from '@/components/motion/CountUp';
import { Reveal, RevealScrollView } from '@/components/motion/Reveal';
import { AppShell } from '@/components/nav/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme';
import { motion, space } from '@/theme/tokens';

const INPUT_MODES = [
  {
    icon: Camera,
    title: 'Photo',
    body: 'Point your camera at a printed contract or notice. SULO reads it for you.',
  },
  {
    icon: Upload,
    title: 'Upload',
    body: 'Have a PDF or image? Upload it and get a plain-language breakdown.',
  },
  {
    icon: Mic,
    title: 'Voice',
    body: 'Prefer to talk? Read a clause aloud or ask a question in your language.',
  },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'Plain-language rewrite',
    body: 'Every clause, rewritten so it actually makes sense — no legalese.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk flags',
    body: 'Terms worth questioning are highlighted, with a clear reason why.',
  },
  {
    icon: Quote,
    title: 'Grounded & cited answers',
    body: 'Answers point to the law or issuance they come from — not guesses.',
  },
  {
    icon: Volume2,
    title: 'Voice in & out',
    body: 'Ask by voice and have explanations read aloud at your own pace.',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    body: 'Built to keep helping where connectivity is thin.',
  },
];

const STATS: { to: number; prefix?: string; suffix?: string; label: string }[] = [
  { to: 3, label: 'Languages' },
  { to: 100, suffix: '%', label: 'Free, always' },
  { to: 6, label: 'Clause checks' },
  { to: 0, label: 'Legalese' },
];

const FOR_EVERYONE = [
  { icon: Languages, label: 'English · Filipino · Cebuano' },
  { icon: Volume2, label: 'Listen & speak' },
  { icon: Type, label: 'Large, adjustable text' },
  { icon: Accessibility, label: 'Built for screen readers' },
];

function Grid({ children, columns }: { children: React.ReactNode; columns: number }) {
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
  const scrollRef = useRef<ScrollView>(null);
  const howItWorksY = useRef(0);

  const scrollToHow = () => {
    scrollRef.current?.scrollTo({ y: howItWorksY.current, animated: true });
  };

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
        <Hero onSeeHow={scrollToHow} />

        {/* 2. TRUST LINE */}
        <Section>
          <Container maxWidth={760}>
            <Reveal>
              <Text variant="h2" center color="ink">
                A first job. A loan. A notice you didn’t expect.{' '}
                <Text variant="h2" color="flameDeep">
                  SULO helps you read it with confidence.
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
                <View key={s.label} style={{ alignItems: 'center', gap: space.xs, minWidth: 120 }}>
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                  <Text variant="label" color="muted" center>
                    {s.label}
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
                    eyebrow="What SULO sees"
                    title="It reads the whole contract, then shows you what matters"
                    center={false}
                  />
                </Reveal>
                {[
                  { icon: FileText, text: 'Every clause rewritten in plain language.' },
                  { icon: ShieldAlert, text: 'Risky terms highlighted, with the reason why.' },
                  { icon: Quote, text: 'Grounded in the actual law — never a guess.' },
                ].map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <Reveal key={b.text} delay={i * motion.stagger}>
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
                          {b.text}
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
                eyebrow="What it does"
                title="Three ways to start"
                subtitle="However the document reaches you, SULO meets you there."
              />
            </Reveal>
            <Grid columns={3}>
              {INPUT_MODES.map((m, i) => (
                <Reveal key={m.title} delay={i * motion.stagger} style={{ flexBasis: cardBasis, flexGrow: 1 }}>
                  <InfoCard icon={m.icon} title={m.title} body={m.body} />
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
              <SectionHeading
                eyebrow="Features"
                title="Everything points back to understanding"
              />
            </Reveal>
            <Grid columns={3}>
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * motion.stagger} style={{ flexBasis: featureBasis, flexGrow: 1 }}>
                  <InfoCard icon={f.icon} title={f.title} body={f.body} tone={i % 2 ? 'blueprint' : 'flame'} />
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
                eyebrow="For everyone"
                title="Accessible by design"
                subtitle="Multimodal, multilingual, and friendly to every reader."
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
                      key={item.label}
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
                      <Text variant="bodyStrong">{item.label}</Text>
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
                <Badge label="The promise" tone="flame" />
                <Text variant="h2">Literacy, not advice.</Text>
                <Text variant="bodyLg" color="muted">
                  SULO explains what your documents mean so you can ask better
                  questions and make your own decisions. It does not give legal
                  advice and is not a substitute for a lawyer. When a question
                  needs real legal judgment, SULO says so — and routes you to{' '}
                  <Text variant="bodyLg" color="ink">PAO</Text> and{' '}
                  <Text variant="bodyLg" color="ink">DOLE</Text> for free help.
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
                  Ready? Open the Coach.
                </Text>
                <Text variant="bodyLg" color="muted" center style={{ maxWidth: 520 }}>
                  Bring a contract you’re unsure about. SULO will walk through it
                  with you, one clause at a time.
                </Text>
                <Button
                  label="Open the Coach"
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
              <Text variant="bodyStrong">Team Siryus</Text>
              <Text variant="small" color="muted">
                ACM TechSprint — Asteria: Illuminate the Future
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              <Text variant="small" color="muted" onPress={() => router.push('/coach')}>
                The Coach
              </Text>
              <Text variant="small" color="muted" onPress={() => router.push('/glossary')}>
                Glossary
              </Text>
              <Text variant="small" color="muted" onPress={() => router.push('/settings')}>
                Settings
              </Text>
            </View>
          </View>
        </Container>
      </RevealScrollView>
    </AppShell>
  );
}
