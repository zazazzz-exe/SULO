import { MotiView } from 'moti';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from 'react-native';

import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { motion } from '@/theme/tokens';

/**
 * Scroll-reveal system. <RevealScrollView> tracks scroll offset + viewport
 * height and notifies registered <Reveal> children. Each Reveal measures its
 * own Y via onLayout and animates in (fade + rise) the first time it enters the
 * viewport — then unsubscribes so it never re-animates. Honors reduced motion.
 */

type ScrollState = { scrollY: number; viewportH: number };
type Listener = (s: ScrollState) => void;

type RevealCtx = {
  register: (l: Listener) => () => void;
  current: () => ScrollState;
};

const Ctx = createContext<RevealCtx | null>(null);

export const RevealScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function RevealScrollView({ onScroll, onLayout, children, ...rest }, ref) {
    const listeners = useRef<Set<Listener>>(new Set());
    const state = useRef<ScrollState>({ scrollY: 0, viewportH: 0 });

    const emit = useCallback(() => {
      for (const l of listeners.current) l(state.current);
    }, []);

    const handleScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        state.current = {
          scrollY: e.nativeEvent.contentOffset.y,
          viewportH: e.nativeEvent.layoutMeasurement.height,
        };
        emit();
        onScroll?.(e);
      },
      [emit, onScroll]
    );

    const handleLayout = useCallback(
      (e: LayoutChangeEvent) => {
        state.current = { ...state.current, viewportH: e.nativeEvent.layout.height };
        emit();
        onLayout?.(e);
      },
      [emit, onLayout]
    );

    const ctx = useRef<RevealCtx>({
      register: (l) => {
        listeners.current.add(l);
        // Push current state immediately so above-the-fold items resolve.
        l(state.current);
        return () => listeners.current.delete(l);
      },
      current: () => state.current,
    });

    return (
      <Ctx.Provider value={ctx.current}>
        <ScrollView
          ref={ref}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onLayout={handleLayout}
          {...rest}
        >
          {children}
        </ScrollView>
      </Ctx.Provider>
    );
  }
);

/**
 * Hook form of Reveal: returns an onLayout handler and a `visible` flag that
 * flips true the first time the element scrolls into view. Lets a section drive
 * its own sequenced/staggered animation (e.g. the How-it-works connectors).
 */
export function useInViewport(): {
  onLayout: (e: LayoutChangeEvent) => void;
  visible: boolean;
} {
  const ctx = useContext(Ctx);
  const reduced = useReducedMotionPref();
  const [visible, setVisible] = useState(reduced || !ctx);
  const y = useRef(0);

  const check = useCallback((s: ScrollState) => {
    if (s.viewportH === 0) return;
    if (y.current + 1 <= s.scrollY + s.viewportH * 0.9) setVisible(true);
  }, []);

  useEffect(() => {
    if (!ctx || reduced || visible) return;
    return ctx.register(check);
  }, [ctx, reduced, visible, check]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      y.current = e.nativeEvent.layout.y;
      if (ctx) check(ctx.current());
    },
    [ctx, check]
  );

  return { onLayout, visible };
}

export function Reveal({
  children,
  delay = 0,
  offset = 80,
  style,
}: {
  children: ReactNode;
  /** Stagger delay (ms). */
  delay?: number;
  /** Rise distance (px) before settling. */
  offset?: number;
  style?: ScrollViewProps['style'];
}) {
  const ctx = useContext(Ctx);
  const reduced = useReducedMotionPref();
  const [visible, setVisible] = useState(reduced || !ctx);
  const y = useRef(0);

  const check = useCallback((s: ScrollState) => {
    if (s.viewportH === 0) return;
    // Reveal when the element's top crosses ~85% of the viewport.
    const trigger = s.scrollY + s.viewportH * 0.9;
    if (y.current + 1 <= trigger) setVisible(true);
  }, []);

  useEffect(() => {
    if (!ctx || reduced || visible) return;
    const unsub = ctx.register(check);
    return unsub;
  }, [ctx, reduced, visible, check]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      y.current = e.nativeEvent.layout.y;
      if (ctx) check(ctx.current());
    },
    [ctx, check]
  );

  return (
    <View onLayout={onLayout} style={style}>
      <MotiView
        animate={{
          opacity: visible ? 1 : 0,
          translateY: visible ? 0 : reduced ? 0 : offset,
        }}
        transition={
          reduced
            ? { type: 'timing', duration: 0 }
            : { type: 'timing', duration: motion.slow, delay }
        }
      >
        {children}
      </MotiView>
    </View>
  );
}
