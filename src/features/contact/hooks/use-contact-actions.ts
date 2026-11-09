'use client';

import { useCallback } from 'react';
import { useNotice, type NoticeState } from '../../common/hooks/use-notice';
import { useRemoveAction, type RemoveAction } from '../../common/hooks/use-remove-action';
import { useTranslation } from '../../i18n/hooks/use-translation';
import type { ContactRequest } from '../domain/contact';
import { removeContactRequest } from '../services/contact.service';

export interface ContactActions extends Pick<NoticeState, 'notice' | 'notify'> {
  remove: RemoveAction<ContactRequest>;
}

export function useContactActions(onChanged: () => void): ContactActions {
  const { t } = useTranslation();
  const { notice, notify } = useNotice();
  const successMessage = useCallback(
    (item: ContactRequest) => t('contact.removed', { name: item.nombreCompleto }),
    [t],
  );
  const remove = useRemoveAction((item: ContactRequest) => removeContactRequest(item.id), {
    successMessage,
    notify,
    onRemoved: onChanged,
  });
  return { notice, notify, remove };
}
