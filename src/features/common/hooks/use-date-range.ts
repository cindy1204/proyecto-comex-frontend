'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';

export interface DateRange {
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  reset: () => void;
  /** Mensaje cuando la fecha inicial es posterior a la final (el backend responde 400). */
  error: string | null;
  /** Valores listos para la query: vacíos mientras el rango sea inválido. */
  createdFrom: string;
  createdTo: string;
}

/** Rango de fechas (`YYYY-MM-DD`) para filtros `createdFrom`/`createdTo`; `onChange` suele volver a la página 1. */
export function useDateRange(onChange?: () => void): DateRange {
  const { t } = useTranslation();
  const [from, setFromState] = useState('');
  const [to, setToState] = useState('');
  const setFrom = useCallback(
    (value: string) => {
      setFromState(value);
      onChange?.();
    },
    [onChange],
  );
  const setTo = useCallback(
    (value: string) => {
      setToState(value);
      onChange?.();
    },
    [onChange],
  );
  const reset = useCallback(() => {
    setFromState('');
    setToState('');
  }, []);

  const error = from && to && from > to ? t('common.dateRangeInvalid') : null;

  return {
    from,
    to,
    setFrom,
    setTo,
    reset,
    error,
    createdFrom: error ? '' : from,
    createdTo: error ? '' : to,
  };
}
