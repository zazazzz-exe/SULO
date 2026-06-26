import { PlayCircle, ChevronDown, Hand } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Reveal, RevealScrollView } from '@/components/motion/Reveal';
import { AppShell } from '@/components/nav/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { glossaryTerms } from '@/data/glossaryTerms';
import { useSettings } from '@/services/settingsService';
import { useTheme } from '@/theme';
import { layout, radii, space } from '@/theme/tokens';
import type { GlossaryTerm } from '@/services/types';

/** A sign-language video placeholder (Phase 2 drops in the real FSL clip). */
function VideoPlaceholder({ name }: { name: string }) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Filipino Sign Language video placeholder for ${name}`}
      style={{
        aspectRatio: 16 / 9,
        borderRadius: radii.md,
        backgroundColor: theme.colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        overflow: 'hidden',
      }}
    >
      <Hand size={34} color={theme.colors.flame} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
        <PlayCircle size={18} color={theme.colors.paper} />
        <Text variant="labelSm" style={{ color: theme.colors.paper }}>
          FSL clip · coming soon
        </Text>
      </View>
      <Text variant="labelSm" style={{ color: theme.colors.muted }}>
        {name}
      </Text>
    </View>
  );
}

function TermCard({ term }: { term: GlossaryTerm }) {
  const theme = useTheme();
  const reduced = useReducedMotionPref();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const translation = term.translation?.[settings.language];

  return (
    <Surface pad="lg" radius="lg" shadow="sm" style={{ gap: space.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${term.term}. ${open ? 'Collapse' : 'Expand'} definition`}
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          minHeight: layout.minTouchTarget,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h3">{term.term}</Text>
          {translation && settings.language !== 'EN' ? (
            <Text variant="small" color="muted">
              {translation}
            </Text>
          ) : null}
        </View>
        <MotiView
          animate={{ rotate: open ? '180deg' : '0deg' }}
          transition={{ type: 'timing', duration: reduced ? 0 : 180 }}
        >
          <ChevronDown size={22} color={theme.colors.muted} />
        </MotiView>
      </Pressable>

      <AnimatePresence>
        {open ? (
          <MotiView
            from={{ opacity: 0, translateY: reduced ? 0 : -6 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: reduced ? 0 : 220 }}
            style={{ gap: space.md }}
          >
            <VideoPlaceholder name={term.videoPlaceholder} />
            <Text variant="bodyLg">{term.definition}</Text>
          </MotiView>
        ) : null}
      </AnimatePresence>
    </Surface>
  );
}

export default function Glossary() {
  return (
    <AppShell>
      <RevealScrollView contentContainerStyle={{ paddingVertical: space.xl }}>
        <Container maxWidth={760}>
          <Reveal>
            <View style={{ gap: space.sm, marginBottom: space.xl }}>
              <Badge label="FSL Glossary" tone="flame" />
              <Text variant="h1">Legal words, made plain</Text>
              <Text variant="bodyLg" color="muted">
                Common contract terms explained simply — each with a Filipino Sign
                Language clip. Tap a term to learn more.
              </Text>
            </View>
          </Reveal>

          <View style={{ gap: space.md }}>
            {glossaryTerms.map((t, i) => (
              <Reveal key={t.id} delay={i * 60}>
                <TermCard term={t} />
              </Reveal>
            ))}
          </View>
        </Container>
      </RevealScrollView>
    </AppShell>
  );
}
