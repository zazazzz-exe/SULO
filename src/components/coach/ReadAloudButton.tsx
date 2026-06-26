import { Volume2 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { PState } from '@/components/ui/pressableState';
import { useSettings } from '@/services/settingsService';
import { speak } from '@/services/voiceService';
import { useTheme } from '@/theme';
import { radii, space, layout } from '@/theme/tokens';

/**
 * "Read aloud" affordance on plain-language answers. Wired to voiceService.speak
 * (a no-op in Phase 1) so the control is reachable now; Phase 2 makes it audible.
 */
export function ReadAloudButton({ text }: { text: string }) {
  const theme = useTheme();
  const { settings } = useSettings();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Read this answer aloud"
      onPress={() =>
        void speak(text, { language: settings.language, speed: settings.voiceSpeed })
      }
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
        borderColor: theme.colors.hairline,
        backgroundColor: pressed || hovered ? theme.colors.inkSoft : 'transparent',
      })}
    >
      <Volume2 size={16} color={theme.colors.blueprint} />
      <Text variant="small" color="blueprint">
        Read aloud
      </Text>
    </Pressable>
  );
}

export const readAloudMinTouch = layout.minTouchTarget;
