'use client';

import { useCallback } from 'react';
import { ApiError } from '../../common/services/api-error';
import { useFormAction, type FormAction } from '../../common/hooks/use-form-action';
import { useTranslation } from '../../i18n/hooks/use-translation';
import type { ContactProductType, ContactRequest } from '../domain/contact';
import {
  readContactForm,
  toCreatePayload,
  toUpdatePayload,
  validateContactForm,
} from '../domain/contact-form';
import { createContactRequest, updateContactRequest } from '../services/contact.service';

/**
 * Formulario de solicitud de contacto: valida en el cliente y deja que el backend complete los
 * errores por campo. Si `request` existe, actualiza; si no, crea.
 */
export function useContactForm(
  request: ContactRequest | null,
  fallbackType: ContactProductType,
  onSaved: (saved: ContactRequest, form: HTMLFormElement) => void,
): FormAction {
  const { t } = useTranslation();
  const action = useCallback(
    async (form: FormData) => {
      const values = readContactForm(form, fallbackType);
      const details = validateContactForm(values, t);
      if (details.length > 0) {
        throw new ApiError({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: '',
          details,
        });
      }
      return request
        ? updateContactRequest(request.id, toUpdatePayload(values))
        : createContactRequest(toCreatePayload(values));
    },
    [request, fallbackType, t],
  );
  return useFormAction(action, { onSuccess: onSaved });
}
