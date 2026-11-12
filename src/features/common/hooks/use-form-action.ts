'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
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
  /** Fija o quita (`null`) el error de un solo campo, p. ej. al salir de él (validación en `blur`). */
  setFieldError: (name: string, message: string | null) => void;
}

/**
 * Envoltorio de formularios no controlados: lee `FormData`, ejecuta la acción (un servicio) y
 * traduce `ApiError` a mensaje general + errores por campo. Si hay errores por campo, mueve el foco
 * al primer control marcado `aria-invalid` (los archivos se omiten: su `<input>` está oculto).
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
  const [focusRequest, setFocusRequest] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Tras pintar los errores (los controles ya tienen `aria-invalid`), enfoca el primero.
  useEffect(() => {
    if (focusRequest === 0) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]:not([type="file"])')
      ?.focus();
  }, [focusRequest]);

  const clearErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const setFieldError = useCallback((name: string, message: string | null) => {
    setFieldErrors((current) => {
      if (message === null) {
        if (!(name in current)) return current;
        const next = { ...current };
        delete next[name];
        return next;
      }
      return current[name] === message ? current : { ...current, [name]: message };
    });
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
        const details = caught instanceof ApiError ? caught.fieldErrors : {};
        setFieldErrors(details);
        if (Object.keys(details).length > 0) {
          formRef.current = form;
          setFocusRequest((count) => count + 1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [action, onSuccess, clearErrors, t],
  );

  return { handleSubmit, isSubmitting, error, fieldErrors, clearErrors, setFieldError };
}
