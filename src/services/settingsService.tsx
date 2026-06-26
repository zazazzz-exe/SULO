import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { StorageKeys, storage } from '@/storage/storage';

import type { Settings } from './types';

/**
 * Settings service — owns user preferences and persists them through the
 * AsyncStorage abstraction. Exposed as a context provider + hook so any screen
 * (Settings, Coach reading-level pill, a11y) reads/writes the same state.
 * Phase 2 can add server sync without changing this surface.
 */

export const defaultSettings: Settings = {
  language: 'EN',
  readingLevel: 'STUDENT',
  voiceEnabled: true,
  voiceSpeed: 1,
  highContrast: false,
  textSize: 'DEFAULT',
  reduceMotion: false,
  torchCursor: true,
  tourSeen: false,
  voiceDemoMode: true,
};

/** Multiplier applied to font sizes for the large-text accessibility option. */
export const textSizeScale: Record<Settings['textSize'], number> = {
  SMALL: 0.92,
  DEFAULT: 1,
  LARGE: 1.14,
  XLARGE: 1.3,
};

export const readingLevelLabel: Record<Settings['readingLevel'], string> = {
  CHILD: 'Child — Keep it very simple',
  STUDENT: 'Student — Explain Like I’m 15',
  ADULT: 'Adult — Clear and complete',
  SENIOR: 'Senior — Large, gentle, step by step',
};

export const languageLabel: Record<Settings['language'], string> = {
  EN: 'English',
  FIL: 'Filipino',
  CEB: 'Cebuano',
};

type SettingsContextValue = {
  settings: Settings;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [ready, setReady] = useState(false);

  // Hydrate persisted settings once on mount.
  useEffect(() => {
    let alive = true;
    storage.getItem<Settings>(StorageKeys.settings, defaultSettings).then((saved) => {
      if (!alive) return;
      setSettings({ ...defaultSettings, ...saved });
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void storage.setItem(StorageKeys.settings, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(defaultSettings);
    void storage.setItem(StorageKeys.settings, defaultSettings);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, ready, update, reset }),
    [settings, ready, update, reset]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    // Safe fallback so hooks used outside the provider (e.g. tests) don't crash.
    return {
      settings: defaultSettings,
      ready: true,
      update: () => {},
      reset: () => {},
    };
  }
  return ctx;
}
