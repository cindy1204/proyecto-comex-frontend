'use client';

import { useEffect, useState } from 'react';

/** Devuelve `value` con retraso: útil para no consultar la API en cada pulsación. */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
