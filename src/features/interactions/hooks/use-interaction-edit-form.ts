'use client';

import { useCallback } from 'react';
import { useFormAction, type FormAction } from '../../common/hooks/use-form-action';
import { readInteractionData } from '../domain/form-fields';
import type { Interaction } from '../domain/interaction';
import { updateInteraction } from '../services/interaction.service';

/** Edición de los datos de un formulario ya enviado (el backend fusiona `data` y revalida el numeral). */
export function useInteractionEditForm(
  interaction: Interaction,
  onSaved: (saved: Interaction) => void,
): FormAction {
  const action = useCallback(
    (values: FormData) =>
      updateInteraction(interaction.id, { data: readInteractionData(interaction.type, values) }),
    [interaction.id, interaction.type],
  );
  return useFormAction(action, { onSuccess: onSaved });
}
