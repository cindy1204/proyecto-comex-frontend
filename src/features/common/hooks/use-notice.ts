'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AlertTone } from '../components/alert';

export interface NoticeMessage {
  tone: AlertTone;
  message: string;
}

export interface NoticeState {
  notice: NoticeMessage | null;
  notify: (tone: AlertTone, message: string) => void;
  clear: () => void;
}

/** Tiempo que permanece visible un aviso de éxito/información antes de cerrarse solo. */
export const NOTICE_AUTO_CLOSE_MS = 6000;

/**
 * Los avisos de éxito e información se cierran solos tras ~6 s; los de error y advertencia NO
 * (WCAG 2.2.1: el usuario necesita tiempo para leerlos y actuar, y se quitan con la siguiente
 * acción). Cada `notify` crea un aviso nuevo, así que el temporizador se reinicia, y el cleanup
 * del efecto lo cancela al reemplazarlo, al limpiarlo o al desmontar.
 */
export function useNotice(): NoticeState {
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const notify = useCallback(
    (tone: AlertTone, message: string) => setNotice({ tone, message }),
    [],
  );
  const clear = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (!notice || (notice.tone !== 'success' && notice.tone !== 'info')) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  return { notice, notify, clear };
}
