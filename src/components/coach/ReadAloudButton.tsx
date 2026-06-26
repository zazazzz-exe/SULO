import { Volume2, Square } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { PState } from '@/components/ui/pressableState';
import { useT } from '@/i18n';
import { useSettings } from '@/services/settingsService';
import { speak, ttsAvailable, type SpeakHandle } from '@/services/voiceService';
import { useTheme } from '@/theme';
import { radii, space, layout } from '@/theme/tokens';

/**
 * "Read aloud" affordance. Wired to real TTS (web SpeechSynthesis / native
 * expo-speech). Respects the voice-out toggle (hidden when voice is off) and
 * toggles play/stop. The answer text on screen serves as the live caption.
 */
export function ReadAloudButton({ text }: { text: string }) {
  const theme = useTheme();
  const { settings } = useSettings();
  const { t } = useT();
  const [playing, setPlaying] = useState(false);
  const handleRef = useRef<SpeakHandle | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      handleRef.current?.stop();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Voice-out turned off, or TTS unavailable → don't show the control.
  if (!settings.voiceEnabled || !ttsAvailable()) return null;

  const stop = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    if (timer.current) clearTimeout(timer.current);
    setPlaying(false);
  };

  const start = async () => {
    handleRef.current = await speak(text, {
      language: settings.language,
      speed: settings.voiceSpeed,
    });
    setPlaying(true);
    // Reset state when speech should be finished (rough estimate).
    const words = text.split(/\s+/).length;
    const ms = (words / (2.5 * settings.voiceSpeed)) * 1000 + 800;
    timer.current = setTimeout(() => setPlaying(false), ms);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={playing ? t('card.stop') : t('card.readAloud')}
      accessibilityState={{ selected: playing }}
      onPress={() => (playing ? stop() : void start())}
      hitSlop={6}
      style={({ pressed, hovered }: PState) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        alignSelf: 'flex-start',
        minHeight: 40,
        paddingVertical: space.xs,
        paddingHorizontal: space.md,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: playing ? theme.colors.flame : theme.colors.hairline,
        backgroundColor: playing
          ? theme.colors.flameSoft
          : pressed || hovered
            ? theme.colors.inkSoft
            : 'transparent',
      })}
    >
      {playing ? (
        <Square size={14} color={theme.colors.flameDeep} fill={theme.colors.flameDeep} />
      ) : (
        <Volume2 size={16} color={theme.colors.blueprint} />
      )}
      <Text variant="small" color={playing ? 'flameDeep' : 'blueprint'}>
        {playing ? t('card.stop') : t('card.readAloud')}
      </Text>
    </Pressable>
  );
}

export const readAloudMinTouch = layout.minTouchTarget;
