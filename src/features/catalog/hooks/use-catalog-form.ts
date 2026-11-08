'use client';

import { useCallback } from 'react';
import { ApiError } from '../../common/services/api-error';
import { useFormAction, type FormAction } from '../../common/hooks/use-form-action';
import { useTranslation } from '../../i18n/hooks/use-translation';
import type { CatalogItem } from '../domain/catalog';
import { readCatalogForm, validateCatalogInput } from '../domain/catalog-form';
import { createCatalogItem, updateCatalogItem } from '../services/catalog.service';

/**
 * Formulario de alta/edición del catálogo: valida en el cliente y deja que el backend complete
 * los errores por campo (`details`). Si `item` existe, actualiza; si no, crea.
 */
export function useCatalogForm(
  item: CatalogItem | null,
  onSaved: (saved: CatalogItem) => void,
): FormAction {
  const { t } = useTranslation();
  const action = useCallback(
    async (form: FormData) => {
      const input = readCatalogForm(form);
      const details = validateCatalogInput(input, form, t);
      if (details.length > 0) {
        throw new ApiError({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: '',
          details,
        });
      }
      return item ? updateCatalogItem(item.id, input) : createCatalogItem(input);
    },
    [item, t],
  );
  return useFormAction(action, { onSuccess: onSaved });
}
