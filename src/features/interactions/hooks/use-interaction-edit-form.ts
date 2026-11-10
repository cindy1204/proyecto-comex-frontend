'use client';

import { useCallback } from 'react';
import { translateIssues } from '../../common/domain/validation';
import { useFormAction, type FormAction } from '../../common/hooks/use-form-action';
import { validationError } from '../../common/services/api-error';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { readInteractionData, validateInteractionForm } from '../domain/form-fields';
import type { Interaction } from '../domain/interaction';
import { updateInteraction } from '../services/interaction.service';

/** Edición de los datos de un formulario ya enviado (el backend fusiona `data` y revalida el numeral). */
export function useInteractionEditForm(
  interaction: Interaction,
  onSaved: (saved: Interaction) => void,
): FormAction {
  const { t } = useTranslation();
  const action = useCallback(
    async (values: FormData) => {
      const issues = validateInteractionForm(interaction.type, values);
      if (issues.length > 0) throw validationError(translateIssues(issues, t));
      return updateInteraction(interaction.id, {
        data: readInteractionData(interaction.type, values),
      });
    },
    [interaction.id, interaction.type, t],
  );
  return useFormAction(action, { onSuccess: onSaved });
}
