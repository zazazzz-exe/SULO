import { useRouter, usePathname } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Wordmark } from '@/components/brand/Wordmark';
import { LanguageSwitcher } from '@/components/nav/LanguageSwitcher';
import { TourSpot } from '@/components/tour/TourSpot';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme';
import { layout, space, webShadow } from '@/theme/tokens';

import { navItems } from './navItems';

/**
 * Persistent top bar. Web/desktop shows inline links + a prominent "Open the
 * Coach" CTA. Mobile shows a compact bar with a hamburger that opens the Drawer.
 */
export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isWide } = useResponsive();
  const { t } = useT();

  return (
    <View
      style={[
        {
          height: layout.headerHeight,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: isWide ? space.xl : space.lg,
          backgroundColor: theme.colors.paper,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.hairline,
        },
        webShadow('sm'),
      ]}
    >
      <Pressable
        onPress={() => router.push('/')}
        accessibilityRole="link"
        accessibilityLabel="SULO home"
        hitSlop={8}
      >
        <Wordmark size="sm" />
      </Pressable>

      {isWide ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          {navItems
            .filter((n) => !n.modal)
            .map((n) => {
              const active = pathname === n.href;
              return (
                <Pressable
                  key={n.href}
                  onPress={() => router.push(n.href)}
                  accessibilityRole="link"
                  accessibilityState={{ selected: active }}
                  hitSlop={8}
                  style={{ paddingVertical: space.sm }}
                >
                  <Text
                    variant="bodyStrong"
                    color={active ? 'flameDeep' : 'ink'}
                  >
                    {t(n.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="link"
            accessibilityLabel={t('nav.settings')}
            hitSlop={8}
            style={{ paddingVertical: space.sm }}
          >
            <Text variant="bodyStrong">{t('nav.settings')}</Text>
          </Pressable>
          <TourSpot id="lang">
            <LanguageSwitcher />
          </TourSpot>
          <Button
            label={t('nav.openCoach')}
            size="sm"
            onPress={() => router.push('/coach')}
          />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <TourSpot id="lang">
            <LanguageSwitcher compact />
          </TourSpot>
          <Pressable
            onPress={onOpenMenu}
            accessibilityRole="button"
            accessibilityLabel={t('nav.menu')}
            hitSlop={10}
            style={{
              width: layout.minTouchTarget,
              height: layout.minTouchTarget,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={24} color={theme.colors.ink} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
