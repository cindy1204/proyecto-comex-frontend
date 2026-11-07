'use client';

import { useCallback, useState } from 'react';
import type { AlertTone } from '../components/alert';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { getErrorMessage } from '../services/api-error';

interface RemoveActionOptions<T> {
  /** Mensaje de éxito para el registro eliminado. */
  successMessage: (item: T) => string;
  notify: (tone: AlertTone, message: string) => void;
  /** Se invoca tras eliminar, normalmente para recargar el listado. */
  onRemoved: () => void;
}

export interface RemoveAction<T> {
  /** Registro pendiente de confirmar. Mientras no sea `null`, el diálogo está abierto. */
  target: T | null;
  ask: (item: T) => void;
  cancel: () => void;
  confirm: () => Promise<void>;
  isRemoving: boolean;
}

/** Flujo "pedir confirmación -> eliminar -> avisar -> recargar" compartido por los listados. */
export function useRemoveAction<T>(
  remove: (item: T) => Promise<void>,
  { successMessage, notify, onRemoved }: RemoveActionOptions<T>,
): RemoveAction<T> {
  const { t } = useTranslation();
  const [target, setTarget] = useState<T | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const cancel = useCallback(() => setTarget(null), []);

  const confirm = useCallback(async () => {
    if (target === null || isRemoving) return;
    setIsRemoving(true);
    try {
      await remove(target);
      notify('success', successMessage(target));
      onRemoved();
    } catch (error) {
      notify('error', getErrorMessage(error, t));
    } finally {
      setTarget(null);
      setIsRemoving(false);
    }
  }, [target, isRemoving, remove, notify, successMessage, onRemoved, t]);

  return { target, ask: setTarget, cancel, confirm, isRemoving };
}
