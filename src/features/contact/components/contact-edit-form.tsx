'use client';

import { Alert } from '../../common/components/alert';
import { Button } from '../../common/components/button';
import { ModalFooter } from '../../common/components/modal-footer';
import { useTranslation } from '../../i18n/hooks/use-translation';
import type { ContactRequest } from '../domain/contact';
import { useContactForm } from '../hooks/use-contact-form';
import { ContactFields } from './contact-fields';

interface ContactEditFormProps {
  request: ContactRequest;
  onSaved: (saved: ContactRequest) => void;
  onCancel: () => void;
}

export function ContactEditForm({ request, onSaved, onCancel }: Readonly<ContactEditFormProps>) {
  const { t } = useTranslation();
  const { handleSubmit, isSubmitting, error, fieldErrors, clearErrors } = useContactForm(
    request,
    request.tipoProducto,
    onSaved,
  );

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onInput={() => {
        if (error) clearErrors();
      }}
      onSubmit={handleSubmit}
    >
      <ContactFields
        defaultType={request.tipoProducto}
        fieldErrors={fieldErrors}
        initial={request}
      />
      {error && <Alert>{error}</Alert>}
      <ModalFooter>
        <Button disabled={isSubmitting} onClick={onCancel} variant="outline">
          {t('common.cancel')}
        </Button>
        <Button isLoading={isSubmitting} type="submit">
          {isSubmitting ? t('contact.form.saving') : t('contact.form.saveChanges')}
        </Button>
      </ModalFooter>
    </form>
  );
}
