import { Plus, Paperclip, ScanLine, Mic, MessageSquareText } from 'lucide-react-native';
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
import { useResponsive } from '@/hooks/useResponsive';
import { sampleConversation } from '@/data/sampleConversation';
import { analyzeDocument } from '@/services/documentService';
import { sendMessage } from '@/services/coachService';
import { useSettings } from '@/services/settingsService';
import { useTheme } from '@/theme';
import { layout, space } from '@/theme/tokens';
import type { ChatMessage } from '@/services/types';

const STARTERS = [
  'Scan my employment contract',
  'Pwede ba nila akong pilitin mag-overtime?',
  'What does “probationary” mean here?',
];

const QUICK_REPLIES = ['Explain like I’m 15', 'Is this fair?', 'What should I ask HR?'];

let idSeq = 1000;
const newId = () => `local-${++idSeq}`;

export default function Coach() {
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const { settings } = useSettings();

  const [messages, setMessages] = useState<ChatMessage[]>(sampleConversation);
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<ClausePanelState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd]);

  const openClause: OpenClause = (payload) => setPanel(payload);

  /** Append a user turn + a typing card, await the mock reply, then swap it in. */
  const runReply = useCallback(
    async (history: ChatMessage[], userMsg: ChatMessage) => {
      const typingId = newId();
      setMessages([...history, userMsg, { id: typingId, role: 'assistant', card: { kind: 'typing' } }]);
      setBusy(true);
      const reply = await sendMessage(history, userMsg.text ?? '', {
        language: settings.language,
        readingLevel: settings.readingLevel,
        attachment: userMsg.attachmentName ? { name: userMsg.attachmentName } : undefined,
      });
      setMessages((prev) => prev.filter((m) => m.id !== typingId).concat(reply));
      setBusy(false);
    },
    [settings.language, settings.readingLevel]
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

  /** Simulate attaching/scanning a document → document-analysis card. */
  const handleAttach = useCallback(
    async (label: string) => {
      if (busy) return;
      const userMsg: ChatMessage = {
        id: newId(),
        role: 'user',
        text: 'Please check this document.',
        attachmentName: label,
      };
      const typingId = newId();
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: typingId, role: 'assistant', card: { kind: 'typing' } },
      ]);
      setBusy(true);
      const analysis = await analyzeDocument({ type: 'mock' });
      setMessages((prev) =>
        prev.filter((m) => m.id !== typingId).concat({
          id: newId(),
          role: 'assistant',
          text: analysis.summary,
          card: {
            kind: 'doc-analysis',
            analysis,
            intro: 'I read your document. I found 3 things worth a closer look.',
          },
        })
      );
      setBusy(false);
    },
    [busy]
  );

  const handleMic = useCallback(() => {
    // voiceService.transcribe is a Phase-1 no-op; surface a friendly note.
    setNotice('Voice input is coming in the next version. For now, type your question.');
    setTimeout(() => setNotice(null), 3200);
  }, []);

  const startNew = useCallback(() => {
    setMessages([]);
    setPanel(null);
  }, []);

  const isEmpty = messages.length === 0;

  /* ----------------------------- Empty state ---------------------------- */
  const EmptyState = (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: space.xl }}>
      <Surface pad="xl" radius="lg" shadow="md" style={{ maxWidth: 560, gap: space.lg }}>
        <View style={{ alignItems: 'center' }}>
          <FlameMascot size={72} face idle />
        </View>
        <Badge label="The Legal Coach" tone="flame" />
        <Text variant="h2">Hi — I’m SULO. Bring me your fine print.</Text>
        <Text variant="bodyLg" color="muted">
          Attach or scan a document, or just ask a question. I’ll explain it in
          plain language, flag what’s risky, and point you to real help. I teach
          legal literacy — I’m not a substitute for a lawyer.
        </Text>

        <View style={{ gap: space.sm }}>
          {STARTERS.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={s}
              onPress={() => handleSend(s)}
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
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <EmptyAffordance icon={Paperclip} label="Upload" onPress={() => handleAttach('contract.pdf')} />
          <EmptyAffordance icon={ScanLine} label="Scan" onPress={() => handleAttach('contract-photo.jpg')} />
          <EmptyAffordance icon={Mic} label="Speak" onPress={handleMic} />
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
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* History sidebar (desktop only) */}
        {isDesktop ? (
          <View
            style={{
              width: 240,
              borderRightWidth: 1,
              borderRightColor: theme.colors.hairline,
              padding: space.md,
              gap: space.sm,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start a new conversation"
              onPress={startNew}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                minHeight: layout.minTouchTarget,
                paddingHorizontal: space.md,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.hairline,
                backgroundColor: pressed ? theme.colors.inkSoft : theme.colors.card,
              })}
            >
              <Plus size={18} color={theme.colors.ink} />
              <Text variant="bodyStrong">New chat</Text>
            </Pressable>

            <Text variant="labelSm" color="muted" style={{ marginTop: space.sm }}>
              Recent
            </Text>
            <View
              style={{
                padding: space.md,
                borderRadius: 12,
                backgroundColor: theme.colors.flameSoft,
              }}
            >
              <Text variant="small" numberOfLines={1}>
                BPO employment contract
              </Text>
              <Text variant="labelSm" color="muted">
                Today
              </Text>
            </View>
          </View>
        ) : null}

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
            quickReplies={isEmpty ? [] : QUICK_REPLIES}
            onSend={handleSend}
            onAttach={() => handleAttach('contract.pdf')}
            onScan={() => handleAttach('contract-photo.jpg')}
            onMic={handleMic}
            busy={busy}
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
