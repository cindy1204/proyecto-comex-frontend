'use client';

import { useCallback } from 'react';
import { useNotice, type NoticeState } from '../../common/hooks/use-notice';
import { useRemoveAction, type RemoveAction } from '../../common/hooks/use-remove-action';
import { useTranslation } from '../../i18n/hooks/use-translation';
import type { Interaction } from '../domain/interaction';
import { removeInteraction } from '../services/interaction.service';

export interface InteractionActions extends Pick<NoticeState, 'notice' | 'notify'> {
  remove: RemoveAction<Interaction>;
}

export function useInteractionActions(onChanged: () => void): InteractionActions {
  const { t } = useTranslation();
  const { notice, notify } = useNotice();
  const successMessage = useCallback(
    (item: Interaction) => t('interactions.removed', { code: item.catalogItem.code }),
    [t],
  );
  const remove = useRemoveAction((item: Interaction) => removeInteraction(item.id), {
    successMessage,
    notify,
    onRemoved: onChanged,
  });
  return { notice, notify, remove };
}
