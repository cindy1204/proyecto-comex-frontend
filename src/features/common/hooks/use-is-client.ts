import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** `false` en el servidor y durante la hidratación; `true` ya en el navegador. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
