'use client';

import { useMemo, useState } from 'react';
import { Alert } from '../../common/components/alert';
import { Button } from '../../common/components/button';
import { ModalFooter } from '../../common/components/modal-footer';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { useCatalogByCategory } from '../../catalog/hooks/use-catalog';
import { OPERATIONS, formatDataValue, type Interaction } from '../domain/interaction';
import { useInteractionEditForm } from '../hooks/use-interaction-edit-form';
import { InteractionFields } from './interaction-fields';

interface InteractionEditFormProps {
  interaction: Interaction;
  onSaved: (saved: Interaction) => void;
  onCancel: () => void;
}

export function InteractionEditForm({
  interaction,
  onSaved,
  onCancel,
}: Readonly<InteractionEditFormProps>) {
  const { t } = useTranslation();
  const { category, numeralField } = OPERATIONS[interaction.type];
  const catalog = useCatalogByCategory(category);
  const [selectedCode, setSelectedCode] = useState(formatDataValue(interaction.data[numeralField]));
  const items = useMemo(() => catalog.data ?? [], [catalog.data]);
  const { handleSubmit, isSubmitting, error, fieldErrors, clearErrors } = useInteractionEditForm(
    interaction,
    onSaved,
  );

  return (
    <form
      className="flex flex-col gap-5"
      onInput={() => {
        if (error) clearErrors();
      }}
      onSubmit={handleSubmit}
    >
      <InteractionFields
        fieldErrors={fieldErrors}
        initialData={interaction.data}
        numeral={{
          items,
          isLoading: catalog.isLoading,
          error: catalog.error,
          value: selectedCode,
          onChange: setSelectedCode,
        }}
        type={interaction.type}
      />
      {error && <Alert>{error}</Alert>}
      <ModalFooter>
        <Button disabled={isSubmitting} onClick={onCancel} variant="outline">
          {t('common.cancel')}
        </Button>
        <Button
          disabled={catalog.isLoading || Boolean(catalog.error)}
          isLoading={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t('interactions.saving') : t('interactions.saveChanges')}
        </Button>
      </ModalFooter>
    </form>
  );
}
