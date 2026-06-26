import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import { radii, space } from '@/theme/tokens';
import type { RiskLevel } from '@/services/types';

import { Text } from './Text';

type BadgeTone = 'neutral' | 'flame' | 'risk' | 'ok' | 'info';

const toneMap: Record<BadgeTone, { bg: keyof ReturnType<typeof useTheme>['colors']; fg: keyof ReturnType<typeof useTheme>['colors'] }> = {
  neutral: { bg: 'inkSoft', fg: 'muted' },
  flame: { bg: 'flameSoft', fg: 'flameDeep' },
  risk: { bg: 'alertBg', fg: 'alert' },
  ok: { bg: 'okBg', fg: 'ok' },
  info: { bg: 'inkSoft', fg: 'blueprint' },
};

/**
 * Mono uppercase badge for labels, cited-basis chips, and risk levels.
 */
export function Badge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: BadgeTone;
  icon?: ReactNode;
}) {
  const theme = useTheme();
  const t = toneMap[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        alignSelf: 'flex-start',
        backgroundColor: theme.colors[t.bg],
        paddingVertical: 4,
        paddingHorizontal: space.sm,
        borderRadius: radii.sm,
      }}
    >
      {icon}
      <Text variant="labelSm" style={{ color: theme.colors[t.fg] }}>
        {label}
      </Text>
    </View>
  );
}

export function riskTone(level: RiskLevel): BadgeTone {
  return level === 'LOW' ? 'ok' : 'risk';
}

/** "HIGH" / "MED" / "LOW" risk badge. */
export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge label={`${level} RISK`} tone={riskTone(level)} />;
}
