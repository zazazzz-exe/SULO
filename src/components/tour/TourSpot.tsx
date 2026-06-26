import { useEffect, useRef, type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTour, type TourRect } from './TourProvider';

/**
 * Wraps a tour target so the tour can find and measure it by id. Layout-neutral
 * (a plain View around its children). `collapsable={false}` keeps the native
 * node measurable on Android.
 */
export function TourSpot({
  id,
  children,
  style,
}: {
  id: string;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const ref = useRef<View>(null);
  const { registerTarget } = useTour();

  useEffect(() => {
    const measure = (): Promise<TourRect | null> =>
      new Promise((resolve) => {
        const node = ref.current as
          | (View & { getBoundingClientRect?: () => DOMRect })
          | null;
        if (!node) return resolve(null);
        if (typeof node.measureInWindow === 'function') {
          node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
          return;
        }
        // Web fallback when the ref resolves to a DOM node.
        if (typeof node.getBoundingClientRect === 'function') {
          const r = node.getBoundingClientRect();
          return resolve({ x: r.left, y: r.top, width: r.width, height: r.height });
        }
        resolve(null);
      });
    return registerTarget(id, measure);
  }, [id, registerTarget]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
