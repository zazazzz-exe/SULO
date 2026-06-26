import { useCallback } from 'react';

import { useSettings } from '@/services/settingsService';
import type { Language } from '@/services/types';

import { en, translations, type LangKey, type StringKey } from './strings';

/** Maps the app Language to a dictionary key. */
export function langKey(language: Language): LangKey {
  return language === 'FIL' ? 'fil' : language === 'CEB' ? 'ceb' : 'en';
}

/** Translate one key for a language, with {placeholder} interpolation.
 * Falls back to English when a translation is missing (e.g. Cebuano for now). */
export function translate(
  language: Language,
  key: StringKey,
  vars?: Record<string, string | number>
): string {
  const lk = langKey(language);
  const dict = translations[lk];
  let str = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

export type TFunction = (key: StringKey, vars?: Record<string, string | number>) => string;

/** Hook: returns a `t()` bound to the user's current language + the language. */
export function useT(): { t: TFunction; language: Language } {
  const { settings } = useSettings();
  const language = settings.language;
  const t = useCallback<TFunction>(
    (key, vars) => translate(language, key, vars),
    [language]
  );
  return { t, language };
}

export type { StringKey } from './strings';
