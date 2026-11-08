'use client';

import { useCallback, useState } from 'react';
import { useNotice, type NoticeState } from '../../common/hooks/use-notice';
import { useRemoveAction, type RemoveAction } from '../../common/hooks/use-remove-action';
import { getErrorMessage } from '../../common/services/api-error';
import { useTranslation } from '../../i18n/hooks/use-translation';
import type { CatalogItem } from '../domain/catalog';
import { removeCatalogItem, restoreCatalogItem } from '../services/catalog.service';

export interface CatalogActions extends Pick<NoticeState, 'notice' | 'notify'> {
  remove: RemoveAction<CatalogItem>;
  restore: (item: CatalogItem) => Promise<void>;
  /** Id del registro que se está restaurando (deshabilita su botón). */
  restoringId: string | null;
}

/** Acciones del administrador sobre el catálogo: eliminar (con confirmación) y restaurar. */
export function useCatalogActions(onChanged: () => void): CatalogActions {
  const { t } = useTranslation();
  const { notice, notify } = useNotice();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const successMessage = useCallback(
    (item: CatalogItem) => t('catalog.admin.removed', { code: item.code }),
    [t],
  );

  const remove = useRemoveAction((item: CatalogItem) => removeCatalogItem(item.id), {
    successMessage,
    notify,
    onRemoved: onChanged,
  });

  const restore = useCallback(
    async (item: CatalogItem) => {
      if (restoringId) return;
      setRestoringId(item.id);
      try {
        await restoreCatalogItem(item.id);
        notify('success', t('catalog.admin.restored', { code: item.code }));
        onChanged();
      } catch (error) {
        notify('error', getErrorMessage(error, t));
      } finally {
        setRestoringId(null);
      }
    },
    [restoringId, notify, onChanged, t],
  );

  return { notice, notify, remove, restore, restoringId };
}
