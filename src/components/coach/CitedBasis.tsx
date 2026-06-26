import { Quote } from 'lucide-react-native';
import { View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { useTheme } from '@/theme';
import { radii, space } from '@/theme/tokens';
import type { Citation } from '@/services/types';

/**
 * The "CITED BASIS" block: a mono chip naming the source plus a one-line gloss,
 * so answers are visibly grounded. Phase 2 can make the chip deep-link.
 */
export function CitedBasis({ citation }: { citation: Citation }) {
  const theme = useTheme();
  const { t } = useT();
  return (
    <View
      style={{
        gap: space.xs,
        padding: space.md,
        borderRadius: radii.sm,
        backgroundColor: theme.colors.paper,
        borderWidth: 1,
        borderColor: theme.colors.hairline,
      }}
    >
      <Badge label={`${t('card.citedBasis')} · ${citation.label}`} tone="info" icon={<Quote size={12} color={theme.colors.blueprint} />} />
      <Text variant="small" color="muted">
        {citation.detail}
      </Text>
    </View>
  );
}
