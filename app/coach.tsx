import { Paperclip, ScanLine, Mic, MessageSquareText } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';

import { FlameMascot } from '@/components/brand/FlameMascot';
import { ClausePanel, type ClausePanelState } from '@/components/coach/ClausePanel';
import { Composer } from '@/components/coach/Composer';
import { AssistantMessage, UserBubble, type OpenClause } from '@/components/coach/MessageCard';
import { AppShell } from '@/components/nav/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import type { PState } from '@/components/ui/pressableState';
import { useT, type StringKey } from '@/i18n';
import { useResponsive } from '@/hooks/useResponsive';
import { pickAndAnalyze, type CaptureSource } from '@/services/documentService';
import { sendMessage } from '@/services/coachService';
import { detectPII, piiWarning } from '@/services/pii';
import { useSettings } from '@/services/settingsService';
import {
  liveAsrAvailable,
  recordOnce,
  startListening,
  transcribe,
  voiceInputAvailable,
  type ListenController,
} from '@/services/voiceService';
import { useTheme } from '@/theme';
import { layout, space } from '@/theme/tokens';
import type { ChatMessage } from '@/services/types';

const STARTER_KEYS: StringKey[] = ['coach.starter1', 'coach.starter2', 'coach.starter3'];
const QUICK_REPLY_KEYS: StringKey[] = ['coach.quick1', 'coach.quick2', 'coach.quick3'];

let idSeq = 1000;
const newId = () => `local-${++idSeq}`;

export default function Coach() {
  const theme = useTheme();
  const { settings } = useSettings();
  const { t } = useT();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<ClausePanelState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const listenRef = useRef<ListenController | null>(null);

  const flashNotice = useCallback((msg: string, ms = 4200) => {
    setNotice(msg);
    setTimeout(() => setNotice((n) => (n === msg ? null : n)), ms);
  }, []);

  const scrollRef = useRef<ScrollView>(null);
  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd]);

  const openClause: OpenClause = (payload) => setPanel(payload);

  /** Append a user turn + a typing card; stream the grounded reply into place. */
  const runReply = useCallback(
    async (history: ChatMessage[], userMsg: ChatMessage) => {
      // Warn (don't block) if the message contains a personal identifier.
      const pii = detectPII(userMsg.text ?? '');
      if (pii.found) flashNotice(piiWarning(pii.kinds));

      const streamId = newId();
      setMessages([...history, userMsg, { id: streamId, role: 'assistant', card: { kind: 'typing' } }]);
      setBusy(true);

      const onToken = (partial: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamId
              ? { id: streamId, role: 'assistant', text: partial, card: { kind: 'plain-answer', text: partial, readAloud: true } }
              : m
          )
        );
      };

      try {
        const reply = await sendMessage(
          history,
          userMsg.text ?? '',
          { language: settings.language, readingLevel: settings.readingLevel },
          onToken
        );
        setMessages((prev) => prev.filter((m) => m.id !== streamId).concat(reply));
      } catch {
        // Never a dead end — fall back to the escalation path.
        setMessages((prev) =>
          prev.filter((m) => m.id !== streamId).concat({
            id: newId(),
            role: 'assistant',
            text: t('coach.err.text'),
            card: {
              kind: 'escalation',
              text: t('coach.err.escalate'),
              resources: [
                { id: 'r-pao', label: 'PAO', detail: 'Public Attorney’s Office — free legal aid.', action: 'Find a PAO office' },
                { id: 'r-dole', label: 'DOLE Hotline 1349', detail: 'Labor concerns hotline.', action: 'Call 1349' },
              ],
            },
          })
        );
      } finally {
        setBusy(false);
      }
    },
    [settings.language, settings.readingLevel, flashNotice, t]
  );

  const handleSend = useCallback(
    (text: string) => {
      if (busy) return;
      const userMsg: ChatMessage = { id: newId(), role: 'user', text };
      setMessages((prev) => {
        void runReply(prev, userMsg);
        return prev; // runReply sets the full next state
      });
    },
    [busy, runReply]
  );

  /** Real capture: pick / photograph a document → OCR → grounded analysis. */
  const handleAttach = useCallback(
    async (source: CaptureSource) => {
      if (busy) return;
      setBusy(true);
      let result;
      try {
        result = await pickAndAnalyze(source);
      } catch {
        result = null;
      }
      if (!result) {
        // User cancelled the picker (or it couldn't open).
        setBusy(false);
        return;
      }

      if (result.pii.found) flashNotice(piiWarning(result.pii.kinds));
      if (result.warnings.length) flashNotice(result.warnings[0], 6000);

      const userMsg: ChatMessage = {
        id: newId(),
        role: 'user',
        text: source === 'camera' ? t('coach.attach.scan') : t('coach.attach.upload'),
        attachmentName: result.sourceName,
      };
      const n = result.analysis.flags.length;
      setMessages((prev) =>
        prev.concat(userMsg, {
          id: newId(),
          role: 'assistant',
          text: result.analysis.summary,
          card: {
            kind: 'doc-analysis',
            analysis: result.analysis,
            intro: result.grounded
              ? t(n === 1 ? 'coach.docIntro.one' : 'coach.docIntro.other', { n })
              : t('coach.docIntro.sample'),
          },
        })
      );
      setBusy(false);
    },
    [busy, flashNotice, t]
  );

  /** Voice input. Demo mode: tap to "listen", tap again to send a scripted,
   *  language-aware question (reliable for demos). Otherwise: live web ASR /
   *  native record → endpoint. */
  const handleMic = useCallback(async () => {
    if (busy) return;

    // Scripted demo voice — deterministic, language-aware.
    if (settings.voiceDemoMode) {
      if (listening) {
        setListening(false);
        setNotice(null);
        handleSend(t('demo.overtime'));
      } else {
        setListening(true);
        flashNotice(t('coach.voice.tapStop'), 15000);
      }
      return;
    }

    // Toggle off if already listening.
    if (listening) {
      listenRef.current?.stop();
      listenRef.current = null;
      setListening(false);
      return;
    }

    if (liveAsrAvailable()) {
      setListening(true);
      flashNotice(t('coach.listen.start'), 10000);
      listenRef.current = startListening({
        language: settings.language,
        onPartial: (partial) => setNotice(t('coach.listen.partial', { t: partial })),
        onFinal: (final) => {
          setListening(false);
          setNotice(null);
          if (final.trim()) handleSend(final.trim());
        },
        onError: (msg) => {
          setListening(false);
          flashNotice(msg);
        },
      });
      return;
    }

    if (voiceInputAvailable()) {
      // Native: record a short clip and transcribe via the ASR endpoint.
      try {
        flashNotice(t('coach.record'), 7000);
        const audio = await recordOnce();
        if (audio) {
          const res = await transcribe(audio, settings.language);
          if (res.text.trim()) handleSend(res.text.trim());
          else flashNotice(t('coach.voice.nocatch'));
        }
      } catch {
        flashNotice(t('coach.voice.fail'));
      }
      return;
    }

    flashNotice(t('coach.voice.none'));
  }, [busy, listening, settings.voiceDemoMode, settings.language, flashNotice, handleSend, t]);

  const isEmpty = messages.length === 0;

  /* ----------------------------- Empty state ---------------------------- */
  const EmptyState = (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: space.xl }}>
      <Surface pad="xl" radius="lg" shadow="md" style={{ maxWidth: 560, gap: space.lg }}>
        <View style={{ alignItems: 'center' }}>
          <FlameMascot size={72} face idle />
        </View>
        <Badge label={t('coach.empty.badge')} tone="flame" />
        <Text variant="h2">{t('coach.empty.title')}</Text>
        <Text variant="bodyLg" color="muted">
          {t('coach.empty.body')}
        </Text>

        <View style={{ gap: space.sm }}>
          {STARTER_KEYS.map((k) => {
            const label = t(k);
            return (
              <Pressable
                key={k}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => handleSend(label)}
                style={({ pressed, hovered }: PState) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.sm,
                  minHeight: layout.minTouchTarget,
                  paddingHorizontal: space.md,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.hairline,
                  backgroundColor: pressed || hovered ? theme.colors.inkSoft : theme.colors.paper,
                })}
              >
                <MessageSquareText size={18} color={theme.colors.flameDeep} />
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <EmptyAffordance icon={Paperclip} label={t('coach.upload')} onPress={() => handleAttach('upload')} />
          <EmptyAffordance icon={ScanLine} label={t('coach.scan')} onPress={() => handleAttach('camera')} />
          <EmptyAffordance icon={Mic} label={t('coach.speak')} onPress={handleMic} />
        </View>
      </Surface>
    </View>
  );

  /* ------------------------------- Thread ------------------------------- */
  const Thread = (
    <ScrollView
      ref={scrollRef}
      onContentSizeChange={scrollToEnd}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      contentContainerStyle={{
        padding: space.lg,
        paddingBottom: space.xxl,
        width: '100%',
        maxWidth: layout.threadMaxWidth + space.lg * 2,
        alignSelf: 'center',
      }}
    >
      {messages.map((m) =>
        m.role === 'user' ? (
          <UserBubble key={m.id} message={m} />
        ) : (
          <AssistantMessage
            key={m.id}
            message={m}
            onOpenClause={openClause}
            onSend={handleSend}
          />
        )
      )}
    </ScrollView>
  );

  return (
    <AppShell>
      <View style={{ flex: 1 }}>
        {/* Thread + composer */}
        <View style={{ flex: 1 }}>
          {isEmpty ? EmptyState : Thread}

          {notice ? (
            <View style={{ paddingHorizontal: space.lg, paddingBottom: space.xs }}>
              <Surface pad="sm" radius="sm" tone="flameSoft" bordered={false}>
                <Text variant="small" color="flameDeep" center>
                  {notice}
                </Text>
              </Surface>
            </View>
          ) : null}

          <Composer
            quickReplies={isEmpty ? [] : QUICK_REPLY_KEYS.map((k) => t(k))}
            onSend={handleSend}
            onAttach={() => handleAttach('upload')}
            onScan={() => handleAttach('camera')}
            onMic={handleMic}
            busy={busy}
            listening={listening}
          />
        </View>
      </View>

      <ClausePanel state={panel} onClose={() => setPanel(null)} />
    </AppShell>
  );
}

function EmptyAffordance({
  icon: Icon,
  label,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed, hovered }: PState) => ({
        flex: 1,
        alignItems: 'center',
        gap: space.xs,
        paddingVertical: space.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.hairline,
        backgroundColor: pressed || hovered ? theme.colors.inkSoft : theme.colors.card,
        minHeight: layout.minTouchTarget,
      })}
    >
      <Icon size={20} color={theme.colors.blueprint} />
      <Text variant="small">{label}</Text>
    </Pressable>
  );
}
