import type { PressableStateCallbackType } from 'react-native';

/**
 * react-native-web adds a `hovered` flag to the Pressable style callback that
 * isn't in RN's core types. This is the typed shape we destructure everywhere
 * so hover affordances stay type-safe on web without `any`.
 */
export type PState = PressableStateCallbackType & { hovered?: boolean };
