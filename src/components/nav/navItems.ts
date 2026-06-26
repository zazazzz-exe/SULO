import type { ComponentType } from 'react';
import { BookOpen, Home, Settings } from 'lucide-react-native';

import type { StringKey } from '@/i18n';

export type NavItem = {
  /** i18n key for the label (translated at render). */
  labelKey: StringKey;
  href: '/' | '/coach' | '/glossary' | '/settings';
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  /** Settings is presented as a modal route. */
  modal?: boolean;
};

// "The Coach" is intentionally omitted — the prominent "Open the Coach" button
// (header + drawer) already routes there, so a nav tab would be redundant.
export const navItems: NavItem[] = [
  { labelKey: 'nav.home', href: '/', icon: Home },
  { labelKey: 'nav.glossary', href: '/glossary', icon: BookOpen },
  { labelKey: 'nav.settings', href: '/settings', icon: Settings, modal: true },
];
