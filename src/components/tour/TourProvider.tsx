import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { StringKey } from '@/i18n';

/**
 * Guided-tour engine. Targets register a `measure()` by id; the tour walks a
 * list of steps, measuring the current target so the overlay can spotlight it.
 * Pure measurement + state — the visual spotlight lives in TourOverlay.
 */

export type TourRect = { x: number; y: number; width: number; height: number };
export type TourStep = { id: string; titleKey: StringKey; bodyKey: StringKey };
type MeasureFn = () => Promise<TourRect | null>;

type TourContextValue = {
  registerTarget: (id: string, measure: MeasureFn) => () => void;
  start: (steps: TourStep[]) => void;
  next: () => void;
  prev: () => void;
  end: () => void;
  active: boolean;
  index: number;
  steps: TourStep[];
  rect: TourRect | null;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const targets = useRef(new Map<string, MeasureFn>());
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<TourRect | null>(null);

  const registerTarget = useCallback((id: string, measure: MeasureFn) => {
    targets.current.set(id, measure);
    return () => {
      if (targets.current.get(id) === measure) targets.current.delete(id);
    };
  }, []);

  const start = useCallback((s: TourStep[]) => {
    if (!s.length) return;
    setSteps(s);
    setIndex(0);
    setRect(null);
    setActive(true);
  }, []);

  const end = useCallback(() => {
    setActive(false);
    setRect(null);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i < steps.length - 1) return i + 1;
      setActive(false);
      setRect(null);
      return i;
    });
  }, [steps.length]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Measure the current step's target (with a few retries while it lays out).
  useEffect(() => {
    if (!active) return;
    let alive = true;
    const step = steps[index];
    if (!step) return;

    let attempts = 0;
    const tryMeasure = async () => {
      const measure = targets.current.get(step.id);
      const r = measure ? await measure() : null;
      if (!alive) return;
      if (r && (r.width > 0 || r.height > 0)) {
        setRect(r);
      } else if (attempts < 12) {
        attempts += 1;
        setTimeout(tryMeasure, 70);
      } else {
        // Target never appeared — skip to the next step (or finish).
        setRect(null);
        next();
      }
    };
    setRect(null);
    tryMeasure();
    return () => {
      alive = false;
    };
    // `next` intentionally omitted to avoid re-running on its identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index, steps]);

  const value = useMemo<TourContextValue>(
    () => ({ registerTarget, start, next, prev, end, active, index, steps, rect }),
    [registerTarget, start, next, prev, end, active, index, steps, rect]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    // Safe no-op outside a provider.
    return {
      registerTarget: () => () => {},
      start: () => {},
      next: () => {},
      prev: () => {},
      end: () => {},
      active: false,
      index: 0,
      steps: [],
      rect: null,
    };
  }
  return ctx;
}
