'use client';

import { useEffect, useRef } from 'react';
import type { NoticeMessage } from '../hooks/use-notice';
import { Alert } from './alert';

/**
 * Región viva persistente: los mensajes de éxito/error se anuncian aunque aparezcan después.
 * Al aparecer se desplaza hasta quedar visible (`block: 'nearest'`, sin animación si el usuario
 * pide menos movimiento) y no mueve el foco: el lector de pantalla ya lo anuncia por la región viva.
 */
export function Notice({ notice }: Readonly<{ notice: NoticeMessage | null }>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notice) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ref.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [notice]);

  return (
    <div aria-atomic="true" aria-live="polite" ref={ref}>
      {notice && <Alert tone={notice.tone}>{notice.message}</Alert>}
    </div>
  );
}
