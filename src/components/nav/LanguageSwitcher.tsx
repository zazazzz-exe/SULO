import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { useSettings } from '@/services/settingsService';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import type { Language } from '@/services/types';

const LANGS: Language[] = ['EN', 'FIL', 'CEB'];

/**
 * Compact EN / FIL / CEB switcher — a global language shortcut shown in the
 * header (and so on the home screen). Tapping a segment switches the whole UI
 * instantly and persists the choice.
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const { settings, update } = useSettings();
  const { t } = useT();

  return (
    <View
      accessibilityRole="radiogroup"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.hairline,
        borderRadius: radii.pill,
        padding: 3,
        gap: 2,
      }}
    >
      {LANGS.map((lng) => {
        const active = settings.language === lng;
        return (
          <Pressable
            key={lng}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t(`lang.${lng}`)}
            onPress={() => update({ language: lng })}
            hitSlop={4}
            style={{
              minHeight: compact ? 28 : 32,
              paddingVertical: compact ? 4 : 6,
              paddingHorizontal: compact ? 8 : 11,
              borderRadius: radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? theme.colors.flame : 'transparent',
            }}
          >
            <Text
              variant="labelSm"
              style={{ color: active ? '#FFFFFF' : theme.colors.muted }}
            >
              {lng}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
