'use client';

import { useCallback, useState } from 'react';
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

/** Mensaje de resultado de una acción (éxito o error) para mostrar con `Notice`. */
export function useNotice(): NoticeState {
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const notify = useCallback(
    (tone: AlertTone, message: string) => setNotice({ tone, message }),
    [],
  );
  const clear = useCallback(() => setNotice(null), []);
  return { notice, notify, clear };
}
