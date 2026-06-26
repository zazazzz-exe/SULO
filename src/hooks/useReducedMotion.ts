import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';

import { useSettings } from '@/services/settingsService';

/**
 * Returns true when motion should be minimized — either the OS "reduce motion"
 * setting is on, OR the user toggled it inside SULO settings. Every non-essential
 * animation (torch breathing, scroll reveals, staggers) must gate on this.
 */
export function useReducedMotionPref(): boolean {
  const systemReduced = useReanimatedReducedMotion();
  const { settings } = useSettings();
  return Boolean(systemReduced) || settings.reduceMotion;
}
