import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { View, type TextStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import { colors, motion, type TypeToken } from '@/theme/tokens';

/**
 * Cycles through a list of phrases, animating each in/out (fade + slide). Used
 * for the hero's "…in your language" line. Holds a fixed line height so the
 * layout never jumps. Static (first phrase) under reduced motion.
 */
export function RotatingWord({
  words,
  interval = 2200,
  variant = 'hero',
  color = 'flameDeep',
  textStyle,
  height,
}: {
  words: string[];
  interval?: number;
  variant?: TypeToken;
  color?: keyof typeof colors;
  textStyle?: TextStyle;
  height?: number;
}) {
  const theme = useTheme();
  const reduced = useReducedMotionPref();
  const [i, setI] = useState(0);
  const lineHeight = height ?? theme.t(variant).lineHeight ?? 40;

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [reduced, words.length, interval]);

  return (
    <View style={{ height: lineHeight, justifyContent: 'center', overflow: 'hidden' }}>
      <AnimatePresence exitBeforeEnter>
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: reduced ? 0 : 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: reduced ? 0 : -14 }}
          transition={{ type: 'timing', duration: reduced ? 0 : motion.base }}
        >
          <Text variant={variant} color={color} center style={textStyle}>
            {words[i]}
          </Text>
        </MotiView>
      </AnimatePresence>
    </View>
  );
}
