import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { motion } from '@/theme/tokens';

/**
 * SULO's signature: an absolutely-positioned amber glow that slowly "breathes"
 * (looping opacity + scale) behind the hero — a torch in the dark. Honors
 * reduced motion by sitting still at a calm steady-state.
 */
export function TorchGlow({
  style,
  size = 520,
}: {
  style?: ViewStyle;
  size?: number;
}) {
  const reduced = useReducedMotionPref();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, { width: size, height: size, pointerEvents: 'none' }, style]}
    >
      <MotiView
        from={{ opacity: reduced ? 0.55 : 0.35, scale: reduced ? 1 : 0.9 }}
        animate={{ opacity: reduced ? 0.55 : 0.7, scale: reduced ? 1 : 1.08 }}
        transition={
          reduced
            ? { type: 'timing', duration: 0 }
            : {
                type: 'timing',
                duration: motion.breath,
                loop: true,
                repeatReverse: true,
              }
        }
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={[
            'rgba(224,123,0,0.55)',
            'rgba(224,123,0,0.18)',
            'rgba(224,123,0,0.0)',
          ]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0.4 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size }]}
        />
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
