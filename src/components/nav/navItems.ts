import type { ComponentType } from 'react';
import { BookOpen, Home, MessageSquareText, Settings } from 'lucide-react-native';

export type NavItem = {
  label: string;
  href: '/' | '/coach' | '/glossary' | '/settings';
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  /** Settings is presented as a modal route. */
  modal?: boolean;
};

export const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'The Coach', href: '/coach', icon: MessageSquareText },
  { label: 'Glossary', href: '/glossary', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings, modal: true },
];
