import { useRouter, usePathname } from 'expo-router';
import { X } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import { layout, motion, space } from '@/theme/tokens';

import { navItems } from './navItems';

/**
 * Mobile slide-in navigation drawer. Renders a scrim + a left panel that slides
 * in (translateX). Tapping a destination or the scrim closes it. The history
 * list lives here on mobile (Coach conversations) — Phase 1 shows the current
 * thread as a single entry.
 */
export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotionPref();
  const insets = useSafeAreaInsets();
  const { t } = useT();

  const go = (href: (typeof navItems)[number]['href']) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open ? (
        <View style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          {/* Scrim */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: reduced ? 0 : motion.fast }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Pressable
              accessibilityLabel={t('nav.close')}
              accessibilityRole="button"
              onPress={onClose}
              style={{ flex: 1, backgroundColor: theme.colors.scrim }}
            />
          </MotiView>

          {/* Panel */}
          <MotiView
            from={{ translateX: reduced ? 0 : -layout.drawerWidth }}
            animate={{ translateX: 0 }}
            exit={{ translateX: reduced ? 0 : -layout.drawerWidth }}
            transition={{ type: 'timing', duration: reduced ? 0 : motion.base }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: layout.drawerWidth,
              backgroundColor: theme.colors.paper,
              borderRightWidth: 1,
              borderRightColor: theme.colors.hairline,
              paddingTop: insets.top + space.lg,
              paddingHorizontal: space.lg,
              paddingBottom: insets.bottom + space.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: space.xl,
              }}
            >
              <Wordmark size="sm" />
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t('nav.close')}
                hitSlop={10}
                style={{
                  width: layout.minTouchTarget,
                  height: layout.minTouchTarget,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={22} color={theme.colors.ink} />
              </Pressable>
            </View>

            <View style={{ gap: space.xs }}>
              {navItems.map((n) => {
                const active = pathname === n.href;
                const Icon = n.icon;
                return (
                  <Pressable
                    key={n.href}
                    onPress={() => go(n.href)}
                    accessibilityRole="link"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space.md,
                      minHeight: layout.minTouchTarget,
                      paddingHorizontal: space.md,
                      borderRadius: 12,
                      backgroundColor: active
                        ? theme.colors.flameSoft
                        : pressed
                          ? theme.colors.inkSoft
                          : 'transparent',
                    })}
                  >
                    <Icon
                      size={20}
                      color={active ? theme.colors.flameDeep : theme.colors.ink}
                    />
                    <Text
                      variant="bodyStrong"
                      color={active ? 'flameDeep' : 'ink'}
                    >
                      {t(n.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flex: 1 }} />

            <Button label={t('nav.openCoach')} fullWidth onPress={() => go('/coach')} />
          </MotiView>
        </View>
      ) : null}
    </AnimatePresence>
  );
}
