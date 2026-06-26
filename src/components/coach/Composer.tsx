import { Paperclip, Mic, Send, ScanLine, ChevronDown, Check } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import type { PState } from '@/components/ui/pressableState';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useResponsive } from '@/hooks/useResponsive';
import {
  readingLevelLabel,
  languageLabel,
  useSettings,
} from '@/services/settingsService';
import { useTheme } from '@/theme';
import { layout, motion, radii, space, webShadow } from '@/theme/tokens';
import type { Language, ReadingLevel } from '@/services/types';

const READING_LEVELS: ReadingLevel[] = ['CHILD', 'STUDENT', 'ADULT', 'SENIOR'];
const LANGUAGES: Language[] = ['EN', 'FIL', 'CEB'];

function round(touch = layout.minTouchTarget) {
  return { width: touch, height: touch, alignItems: 'center', justifyContent: 'center' } as const;
}

/** Pop-over selector for the reading level. */
function ReadingLevelControl() {
  const theme = useTheme();
  const reduced = useReducedMotionPref();
  const { settings, update } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Reading level: ${readingLevelLabel[settings.readingLevel]}. Change`}
        onPress={() => setOpen((o) => !o)}
        hitSlop={4}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.xs,
          minHeight: 36,
          paddingVertical: space.xs,
          paddingHorizontal: space.md,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: theme.colors.hairline,
          backgroundColor: pressed ? theme.colors.inkSoft : theme.colors.card,
        })}
      >
        <Text variant="labelSm" color="flameDeep">
          {readingLevelLabel[settings.readingLevel].split(' — ')[0]}
        </Text>
        <ChevronDown size={14} color={theme.colors.muted} />
      </Pressable>

      <AnimatePresence>
        {open ? (
          <MotiView
            from={{ opacity: 0, translateY: reduced ? 0 : 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: reduced ? 0 : 8 }}
            transition={{ type: 'timing', duration: reduced ? 0 : motion.fast }}
            style={[
              {
                position: 'absolute',
                bottom: 44,
                left: 0,
                width: 260,
                backgroundColor: theme.colors.card,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: theme.colors.hairline,
                padding: space.xs,
                zIndex: 30,
              },
              webShadow('md'),
            ]}
          >
            {READING_LEVELS.map((lvl) => {
              const active = settings.readingLevel === lvl;
              return (
                <Pressable
                  key={lvl}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    update({ readingLevel: lvl });
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.sm,
                    minHeight: 44,
                    paddingHorizontal: space.md,
                    borderRadius: radii.sm,
                    backgroundColor: active
                      ? theme.colors.flameSoft
                      : pressed
                        ? theme.colors.inkSoft
                        : 'transparent',
                  })}
                >
                  <View style={{ width: 16 }}>
                    {active ? <Check size={16} color={theme.colors.flameDeep} /> : null}
                  </View>
                  <Text variant="small" color={active ? 'flameDeep' : 'ink'} style={{ flex: 1 }}>
                    {readingLevelLabel[lvl]}
                  </Text>
                </Pressable>
              );
            })}
          </MotiView>
        ) : null}
      </AnimatePresence>
    </View>
  );
}

/** Tap to cycle the language; long, clear accessibility label. */
function LanguageControl() {
  const theme = useTheme();
  const { settings, update } = useSettings();
  const cycle = () => {
    const i = LANGUAGES.indexOf(settings.language);
    update({ language: LANGUAGES[(i + 1) % LANGUAGES.length] });
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Language: ${languageLabel[settings.language]}. Tap to change`}
      onPress={cycle}
      hitSlop={4}
      style={({ pressed }) => ({
        minHeight: 36,
        paddingVertical: space.xs,
        paddingHorizontal: space.md,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: theme.colors.hairline,
        backgroundColor: pressed ? theme.colors.inkSoft : theme.colors.card,
        justifyContent: 'center',
      })}
    >
      <Text variant="labelSm" color="blueprint">
        {settings.language}
      </Text>
    </Pressable>
  );
}

export type ComposerProps = {
  quickReplies: string[];
  onSend: (text: string) => void;
  onAttach: () => void;
  onScan: () => void;
  onMic: () => void;
  busy?: boolean;
};

/**
 * The Coach composer: quick-reply chips, an input row (attach / scan / text /
 * mic / send), the reading-level + language controls, and the literacy
 * microcopy. Voice + attach are wired to the service layer (Phase-1 stubs).
 */
export function Composer({
  quickReplies,
  onSend,
  onAttach,
  onScan,
  onMic,
  busy,
}: ComposerProps) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t || busy) return;
    setText('');
    onSend(t);
  };

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme.colors.hairline,
        backgroundColor: theme.colors.paper,
        paddingHorizontal: space.lg,
        paddingTop: space.md,
        gap: space.sm,
      }}
    >
      {/* Quick-reply chips */}
      {quickReplies.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {quickReplies.map((q) => (
            <Pressable
              key={q}
              accessibilityRole="button"
              accessibilityLabel={q}
              onPress={() => onSend(q)}
              style={({ pressed, hovered }: PState) => ({
                paddingVertical: space.xs,
                paddingHorizontal: space.md,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: theme.colors.hairline,
                backgroundColor: pressed || hovered ? theme.colors.inkSoft : theme.colors.card,
                minHeight: 36,
                justifyContent: 'center',
              })}
            >
              <Text variant="small">{q}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Controls row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
        <ReadingLevelControl />
        <LanguageControl />
      </View>

      {/* Input row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: space.xs,
          backgroundColor: theme.colors.card,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.hairline,
          paddingHorizontal: space.sm,
          paddingVertical: space.xs,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach a document"
          onPress={onAttach}
          style={round()}
        >
          <Paperclip size={20} color={theme.colors.muted} />
        </Pressable>
        {isMobile ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan a document"
            onPress={onScan}
            style={round()}
          >
            <ScanLine size={20} color={theme.colors.muted} />
          </Pressable>
        ) : null}

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask about a clause, or paste it here…"
          placeholderTextColor={theme.colors.muted}
          multiline
          onSubmitEditing={submit}
          accessibilityLabel="Message SULO"
          style={{
            flex: 1,
            minHeight: layout.minTouchTarget,
            maxHeight: 140,
            paddingVertical: space.sm,
            paddingHorizontal: space.sm,
            color: theme.colors.ink,
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
          }}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Record voice message"
          onPress={onMic}
          style={round()}
        >
          <Mic size={20} color={theme.colors.muted} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !text.trim() || !!busy }}
          onPress={submit}
          disabled={!text.trim() || !!busy}
          style={[
            round(),
            {
              borderRadius: radii.pill,
              backgroundColor: text.trim() && !busy ? theme.colors.flame : theme.colors.hairline,
            },
          ]}
        >
          <Send size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Literacy microcopy */}
      <View style={{ alignItems: 'center', paddingBottom: space.sm }}>
        <Badge label="SULO teaches literacy — not legal advice" tone="neutral" />
      </View>
    </View>
  );
}
