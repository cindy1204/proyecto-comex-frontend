'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { getErrorMessage, isAbortError } from '../services/api-error';

type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

interface Settled<T> {
  fetcher: Fetcher<T>;
  version: number;
  data: T | null;
  failure: { error: unknown } | null;
}

export interface AsyncData<T> {
  /** Último dato recibido; se conserva mientras llega el siguiente (útil al paginar). */
  data: T | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
}

/**
 * Carga datos con un servicio. `fetcher` debe tener identidad estable (`useCallback`): cuando
 * cambia, se cancela la petición anterior y se pide de nuevo.
 */
export function useAsyncData<T>(fetcher: Fetcher<T>): AsyncData<T> {
  const { t } = useTranslation();
  const [version, setVersion] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ fetcher, version, data, failure: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setSettled({ fetcher, version, data: null, failure: { error } });
      });
    return () => controller.abort();
  }, [fetcher, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const isCurrent = settled?.fetcher === fetcher && settled.version === version;

  return {
    data: settled?.data ?? null,
    error: isCurrent && settled.failure ? getErrorMessage(settled.failure.error, t) : null,
    isLoading: !isCurrent,
    reload,
  };
}
