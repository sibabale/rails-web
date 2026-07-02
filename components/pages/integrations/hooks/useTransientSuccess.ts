'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type TransientState = 'gone' | 'visible' | 'exiting';

export function useTransientSuccess<K extends string>(keys: readonly K[]) {
  const initial = keys.reduce(
    (acc, k) => ({ ...acc, [k]: 'gone' as TransientState }),
    {} as Record<K, TransientState>
  );
  const [state, setState] = useState<Record<K, TransientState>>(initial);

  const timersRef = useRef<Record<K, { hold?: number; exit?: number }>>(
    keys.reduce(
      (acc, k) => ({ ...acc, [k]: {} }),
      {} as Record<K, { hold?: number; exit?: number }>
    )
  );
  const previousToneRef = useRef<Record<K, string | undefined>>(
    keys.reduce(
      (acc, k) => ({ ...acc, [k]: undefined }),
      {} as Record<K, string | undefined>
    )
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      (Object.keys(timers) as K[]).forEach((k) => {
        if (timers[k].hold) window.clearTimeout(timers[k].hold);
        if (timers[k].exit) window.clearTimeout(timers[k].exit);
      });
    };
  }, []);

  const start = useCallback((key: K) => {
    const timers = timersRef.current[key];
    if (timers.hold) window.clearTimeout(timers.hold);
    if (timers.exit) window.clearTimeout(timers.exit);
    setState((prev) => ({ ...prev, [key]: 'visible' }));
    timers.hold = window.setTimeout(() => {
      setState((prev) => ({ ...prev, [key]: 'exiting' }));
      timers.exit = window.setTimeout(() => {
        setState((prev) => ({ ...prev, [key]: 'gone' }));
      }, 300);
    }, 2500);
  }, []);

  const observeTone = useCallback(
    (key: K, tone: string) => {
      const previous = previousToneRef.current[key];
      if (previous === tone) return;
      previousToneRef.current[key] = tone;
      if (tone === 'success' && previous !== undefined && previous !== 'success') {
        start(key);
      }
    },
    [start]
  );

  return { state, observeTone };
}
