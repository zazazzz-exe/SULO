import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { AppHeader } from './AppHeader';
import { Drawer } from './Drawer';

/**
 * App frame: a persistent header on top, an optional slide-in Drawer (mobile),
 * and the screen content below. Wrap every full screen with this so navigation
 * is consistent across web and native.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.paper }}>
      <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.paper }}>
        <AppHeader onOpenMenu={() => setMenuOpen(true)} />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}
