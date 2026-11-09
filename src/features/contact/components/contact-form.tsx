'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Alert } from '../../common/components/alert';
import { Button, buttonStyles } from '../../common/components/button';
import { ROUTES } from '../../common/config';
import { useSession } from '../../auth/hooks/use-session';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { isContactProductType } from '../domain/contact';
import { useContactForm } from '../hooks/use-contact-form';
import { ContactFields } from './contact-fields';

export function ContactForm() {
  const { t } = useTranslation();
  const requestedType = useSearchParams().get('tipoProducto');
  const initialType = isContactProductType(requestedType) ? requestedType : 'importaciones';
  const { isAuthenticated } = useSession();
  const [sent, setSent] = useState(false);

  const onSaved = useCallback((_saved: unknown, form: HTMLFormElement) => {
    form.reset();
    setSent(true);
  }, []);

  const { handleSubmit, isSubmitting, error, fieldErrors, clearErrors } = useContactForm(
    null,
    initialType,
    onSaved,
  );

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onInput={() => {
        if (sent) setSent(false);
        if (error) clearErrors();
      }}
      onSubmit={handleSubmit}
    >
      <ContactFields defaultType={initialType} fieldErrors={fieldErrors} />

      {error && <Alert>{error}</Alert>}
      {sent && (
        <Alert tone="success">
          {isAuthenticated ? (
            <>
              {t('contact.form.sentAuthenticated')}{' '}
              <Link className="font-semibold underline" href={ROUTES.myRequests}>
                {t('nav.myRequests')}
              </Link>
              .
            </>
          ) : (
            t('contact.form.sentAnonymous')
          )}
        </Alert>
      )}
      <div className="flex flex-wrap gap-3">
        <Button isLoading={isSubmitting} type="submit">
          {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
        </Button>
        {!isAuthenticated && (
          <Link className={buttonStyles({ variant: 'outline' })} href={ROUTES.login}>
            {t('layout.login')}
          </Link>
        )}
      </div>
    </form>
  );
}
