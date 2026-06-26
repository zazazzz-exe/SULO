import { Flame, ChevronRight, FileText, Paperclip, Phone, ExternalLink } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { FlameMascot } from '@/components/brand/FlameMascot';
import { Badge, RiskBadge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import type { PState } from '@/components/ui/pressableState';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme';
import { radii, space, layout } from '@/theme/tokens';
import type {
  ChatMessage,
  Clause,
  MessageCard as MessageCardType,
  RiskFlag,
  SuggestedChip,
} from '@/services/types';

import { CitedBasis } from './CitedBasis';
import { ReadAloudButton } from './ReadAloudButton';
import { TypingIndicator } from './TypingIndicator';

export type OpenClause = (payload: { clause: Clause; flag?: RiskFlag }) => void;

/* ----------------------------- User bubble ----------------------------- */

export function UserBubble({ message }: { message: ChatMessage }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'flex-end', marginVertical: space.sm }}>
      <Surface
        pad="md"
        radius="lg"
        shadow="none"
        bordered={false}
        style={{ backgroundColor: theme.colors.ink, maxWidth: '88%' }}
      >
        {message.attachmentName ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.xs,
              marginBottom: space.xs,
            }}
          >
            <Paperclip size={14} color={theme.colors.paper} />
            <Text variant="labelSm" style={{ color: theme.colors.paper }}>
              {message.attachmentName}
            </Text>
          </View>
        ) : null}
        <Text variant="body" style={{ color: theme.colors.paper }}>
          {message.text}
        </Text>
      </Surface>
      {message.timeLabel ? (
        <Text variant="labelSm" color="muted" style={{ marginTop: 4, marginRight: 4 }}>
          {message.timeLabel}
        </Text>
      ) : null}
    </View>
  );
}

/* --------------------------- Assistant shell --------------------------- */

function AssistantShell({
  children,
  timeLabel,
}: {
  children: React.ReactNode;
  timeLabel?: string;
}) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  return (
    <View style={{ flexDirection: 'row', gap: space.sm, marginVertical: space.sm }}>
      {!isMobile ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radii.pill,
            backgroundColor: theme.colors.flameSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          <FlameMascot size={22} face idle={false} />
        </View>
      ) : null}
      <View style={{ flex: 1, maxWidth: layout.threadMaxWidth }}>
        {children}
        {timeLabel ? (
          <Text variant="labelSm" color="muted" style={{ marginTop: 4, marginLeft: 4 }}>
            {timeLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ------------------------- Suggested-question chips -------------------- */

function Suggestions({
  items,
  onSend,
}: {
  items: SuggestedChip[];
  onSend: (text: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
      {items.map((s) => (
        <Chip key={s.id} label={s.label} onPress={() => onSend(s.send ?? s.label)} />
      ))}
    </View>
  );
}

/* ------------------------------ Card bodies ---------------------------- */

function PlainAnswer({
  card,
  onSend,
}: {
  card: Extract<MessageCardType, { kind: 'plain-answer' }>;
  onSend: (text: string) => void;
}) {
  const theme = useTheme();
  return (
    <Surface pad="lg" radius="lg" style={{ gap: space.md }}>
      <Text variant="bodyLg">{card.text}</Text>
      {card.citedBasis ? <CitedBasis citation={card.citedBasis} /> : null}
      {card.notLegalAdvice ? (
        <View
          style={{
            flexDirection: 'row',
            gap: space.xs,
            paddingTop: space.xs,
            borderTopWidth: 1,
            borderTopColor: theme.colors.hairline,
          }}
        >
          <Text variant="small" color="muted">
            ⚖︎ {card.notLegalAdvice}
          </Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        {card.readAloud ? <ReadAloudButton text={card.text} /> : null}
      </View>
      {card.suggestions?.length ? (
        <Suggestions items={card.suggestions} onSend={onSend} />
      ) : null}
    </Surface>
  );
}

function DocAnalysis({
  card,
  onOpenClause,
}: {
  card: Extract<MessageCardType, { kind: 'doc-analysis' }>;
  onOpenClause: OpenClause;
}) {
  const theme = useTheme();
  const { analysis } = card;
  return (
    <Surface pad="lg" radius="lg" shadow="md" style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <FileText size={18} color={theme.colors.blueprint} />
        <Badge label={analysis.documentType} tone="info" />
      </View>
      <Text variant="h3">{analysis.title}</Text>
      <Text variant="body" color="muted">
        {card.intro}
      </Text>

      {/* Key-facts strip */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {analysis.keyFacts.map((f) => (
          <View
            key={f.label}
            style={{
              paddingVertical: space.sm,
              paddingHorizontal: space.md,
              borderRadius: radii.sm,
              backgroundColor:
                f.tone === 'risk'
                  ? theme.colors.alertBg
                  : f.tone === 'ok'
                    ? theme.colors.okBg
                    : theme.colors.paper,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
              minWidth: 120,
            }}
          >
            <Text variant="labelSm" color="muted">
              {f.label}
            </Text>
            <Text
              variant="bodyStrong"
              color={f.tone === 'risk' ? 'alert' : f.tone === 'ok' ? 'ok' : 'ink'}
            >
              {f.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Flag summary line */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          padding: space.md,
          borderRadius: radii.sm,
          backgroundColor: theme.colors.flameSoft,
        }}
      >
        <Flame size={16} color={theme.colors.flameDeep} />
        <Text variant="bodyStrong" color="flameDeep" style={{ flex: 1 }}>
          I found {analysis.flags.length} things worth a closer look.
        </Text>
      </View>

      {/* Quick links into each flagged clause */}
      <View style={{ gap: space.xs }}>
        {analysis.flags.map((flag) => {
          const clause = analysis.clauses.find((c) => c.id === flag.clauseId)!;
          return (
            <Pressable
              key={flag.id}
              accessibilityRole="button"
              accessibilityLabel={`Open clause: ${flag.title}`}
              onPress={() => onOpenClause({ clause, flag })}
              style={({ pressed, hovered }: PState) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                minHeight: layout.minTouchTarget,
                paddingHorizontal: space.md,
                borderRadius: radii.sm,
                borderWidth: 1,
                borderColor: theme.colors.hairline,
                backgroundColor: pressed || hovered ? theme.colors.inkSoft : theme.colors.card,
              })}
            >
              <RiskBadge level={flag.level} />
              <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
                {flag.title}
              </Text>
              <ChevronRight size={18} color={theme.colors.muted} />
            </Pressable>
          );
        })}
      </View>
    </Surface>
  );
}

function RiskFlagBody({
  card,
  onOpenClause,
}: {
  card: Extract<MessageCardType, { kind: 'risk-flag' }>;
  onOpenClause: OpenClause;
}) {
  const theme = useTheme();
  const { flag, clause } = card;
  return (
    <Surface
      pad="lg"
      radius="lg"
      tone="card"
      style={{ gap: space.md, borderColor: flag.level === 'MED' ? theme.colors.hairline : theme.colors.alertBg }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <RiskBadge level={flag.level} />
        <Text variant="h3" style={{ flex: 1 }}>
          {flag.title}
        </Text>
      </View>
      <Text variant="body">{flag.explanation}</Text>
      <CitedBasis citation={flag.citedBasis} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`See the full clause: ${flag.title}`}
        onPress={() => onOpenClause({ clause, flag })}
        style={({ pressed, hovered }: PState) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: layout.minTouchTarget,
          paddingHorizontal: space.md,
          borderRadius: radii.sm,
          backgroundColor: pressed || hovered ? theme.colors.inkSoft : theme.colors.paper,
          borderWidth: 1,
          borderColor: theme.colors.hairline,
        })}
      >
        <Text variant="bodyStrong" color="blueprint">
          See the full clause
        </Text>
        <ChevronRight size={18} color={theme.colors.blueprint} />
      </Pressable>
    </Surface>
  );
}

function WhatIf({
  card,
  onOpenClause,
}: {
  card: Extract<MessageCardType, { kind: 'what-if' }>;
  onOpenClause: OpenClause;
}) {
  const theme = useTheme();
  return (
    <Surface pad="lg" radius="lg" style={{ gap: space.md }}>
      <Badge label="What if" tone="flame" />
      <Text variant="h3">{card.scenario}</Text>
      <View
        style={{
          padding: space.md,
          borderRadius: radii.sm,
          backgroundColor: theme.colors.paper,
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.flame,
          borderWidth: 1,
          borderColor: theme.colors.hairline,
        }}
      >
        <Text variant="labelSm" color="muted" style={{ marginBottom: 4 }}>
          {card.clause.title}
        </Text>
        <Text variant="body" color="muted">
          {card.consequence}
        </Text>
      </View>
      {card.citedBasis ? <CitedBasis citation={card.citedBasis} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`See the clause: ${card.clause.title}`}
        onPress={() => onOpenClause({ clause: card.clause })}
        hitSlop={6}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignSelf: 'flex-start' })}
      >
        <Text variant="small" color="blueprint">
          View the exact clause →
        </Text>
      </Pressable>
    </Surface>
  );
}

function Escalation({
  card,
}: {
  card: Extract<MessageCardType, { kind: 'escalation' }>;
}) {
  const theme = useTheme();
  return (
    <Surface pad="lg" radius="lg" tone="alertBg" bordered={false} style={{ gap: space.md }}>
      <Badge label="Talk to a real lawyer" tone="risk" />
      <Text variant="bodyLg" color="ink">
        {card.text}
      </Text>
      <View style={{ gap: space.sm }}>
        {card.resources.map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            accessibilityLabel={`${r.label}. ${r.action}`}
            style={({ pressed, hovered }: PState) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              minHeight: layout.minTouchTarget,
              padding: space.md,
              borderRadius: radii.md,
              backgroundColor: pressed || hovered ? theme.colors.inkSoft : theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
            })}
          >
            {r.id.includes('dole') ? (
              <Phone size={18} color={theme.colors.alert} />
            ) : (
              <ExternalLink size={18} color={theme.colors.alert} />
            )}
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{r.label}</Text>
              <Text variant="small" color="muted">
                {r.detail}
              </Text>
            </View>
            <Text variant="labelSm" color="alert">
              {r.action}
            </Text>
          </Pressable>
        ))}
      </View>
    </Surface>
  );
}

/* ----------------------------- Public entry ---------------------------- */

export function AssistantMessage({
  message,
  onOpenClause,
  onSend,
}: {
  message: ChatMessage;
  onOpenClause: OpenClause;
  onSend: (text: string) => void;
}) {
  const card = message.card;
  if (!card) return null;

  let body: React.ReactNode = null;
  switch (card.kind) {
    case 'typing':
      body = (
        <Surface pad="md" radius="lg">
          <TypingIndicator />
        </Surface>
      );
      break;
    case 'plain-answer':
      body = <PlainAnswer card={card} onSend={onSend} />;
      break;
    case 'doc-analysis':
      body = <DocAnalysis card={card} onOpenClause={onOpenClause} />;
      break;
    case 'risk-flag':
      body = <RiskFlagBody card={card} onOpenClause={onOpenClause} />;
      break;
    case 'what-if':
      body = <WhatIf card={card} onOpenClause={onOpenClause} />;
      break;
    case 'escalation':
      body = <Escalation card={card} />;
      break;
  }

  return (
    <AssistantShell timeLabel={card.kind === 'typing' ? undefined : message.timeLabel}>
      {body}
    </AssistantShell>
  );
}
