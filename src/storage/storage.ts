import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin, typed wrapper around AsyncStorage. The ONLY place the app talks to
 * device storage — components and services must go through this so Phase 2 can
 * swap the backend (SecureStore, SQLite, server sync) without touching the UI.
 * Never call localStorage / AsyncStorage directly elsewhere.
 */
export const storage = {
  async getItem<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Swallow write errors in Phase 1 (mock); Phase 2 can surface telemetry.
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // no-op
    }
  },
};

export const StorageKeys = {
  settings: 'sulo.settings.v1',
  conversations: 'sulo.conversations.v1',
} as const;
