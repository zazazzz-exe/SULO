import type { ComponentType, ReactNode } from 'react';
import { View } from 'react-native';

import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme';
import { radii, space } from '@/theme/tokens';

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

/** Vertical rhythm + optional tinted background band for a landing section. */
export function Section({
  children,
  band,
  style,
}: {
  children: ReactNode;
  band?: boolean;
  style?: object;
}) {
  const theme = useTheme();
  const { isWide } = useResponsive();
  return (
    <View
      style={[
        {
          paddingVertical: isWide ? space.xxxl : space.xxl,
          backgroundColor: band ? theme.colors.card : 'transparent',
          borderTopWidth: band ? 1 : 0,
          borderBottomWidth: band ? 1 : 0,
          borderColor: theme.colors.hairline,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <View
      style={{
        gap: space.sm,
        marginBottom: space.xl,
        alignItems: center ? 'center' : 'flex-start',
        maxWidth: 680,
        alignSelf: center ? 'center' : 'flex-start',
      }}
    >
      {eyebrow ? (
        <Text variant="label" color="flameDeep" center={center}>
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="h1" center={center}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyLg" color="muted" center={center}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

/** Rounded amber-tinted icon tile used on cards. */
export function IconTile({ icon: Icon, tone = 'flame' }: { icon: IconType; tone?: 'flame' | 'blueprint' }) {
  const theme = useTheme();
  const color = tone === 'flame' ? theme.colors.flameDeep : theme.colors.blueprint;
  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: radii.md,
        backgroundColor: tone === 'flame' ? theme.colors.flameSoft : theme.colors.inkSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={24} color={color} strokeWidth={1.8} />
    </View>
  );
}

/**
 * A lift-on-hover/press info card (input modes, features). Pressable so it gives
 * tactile feedback; if onPress is omitted it's a static surface.
 */
export function InfoCard({
  icon,
  title,
  body,
  tone,
}: {
  icon: IconType;
  title: string;
  body: string;
  tone?: 'flame' | 'blueprint';
}) {
  return (
    <Surface pad="xl" radius="lg" shadow="sm" style={{ flex: 1, gap: space.md, minWidth: 220 }}>
      <IconTile icon={icon} tone={tone} />
      <Text variant="h3">{title}</Text>
      <Text variant="body" color="muted">
        {body}
      </Text>
    </Surface>
  );
}
