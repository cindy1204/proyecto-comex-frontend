'use client';

import { useCallback, useState, type FormEvent } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import type { FieldErrors } from '../domain/api-error';
import { ApiError, getErrorMessage } from '../services/api-error';

interface FormActionOptions<TResult> {
  onSuccess?: (result: TResult, form: HTMLFormElement) => void;
}

export interface FormAction {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  /** Mensaje general del backend (para un `Alert`). */
  error: string | null;
  /** Errores por campo (`details` del backend), para pasar a `Field error=...`. */
  fieldErrors: FieldErrors;
  clearErrors: () => void;
}

/**
 * Envoltorio de formularios no controlados: lee `FormData`, ejecuta la acción (un servicio) y
 * traduce `ApiError` a mensaje general + errores por campo.
 */
export function useFormAction<TResult>(
  action: (values: FormData) => Promise<TResult>,
  options: FormActionOptions<TResult> = {},
): FormAction {
  const { onSuccess } = options;
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      clearErrors();
      setIsSubmitting(true);
      try {
        const result = await action(new FormData(form));
        onSuccess?.(result, form);
      } catch (caught) {
        setError(getErrorMessage(caught, t));
        setFieldErrors(caught instanceof ApiError ? caught.fieldErrors : {});
      } finally {
        setIsSubmitting(false);
      }
    },
    [action, onSuccess, clearErrors, t],
  );

  return { handleSubmit, isSubmitting, error, fieldErrors, clearErrors };
}
