'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Alert } from '../../common/components/alert';
import { Button, buttonStyles } from '../../common/components/button';
import { Field } from '../../common/components/field';
import { Input } from '../../common/components/input';
import { Select } from '../../common/components/select';
import { Textarea } from '../../common/components/textarea';
import { ROUTES } from '../../common/config';
import { useFormAction } from '../../common/hooks/use-form-action';
import { useCatalogByCategory } from '../../catalog/hooks/use-catalog';
import { DICTIONARIES } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { validateContactForm, readContactForm } from '../../contact/domain/contact-form';
import { createContactRequest } from '../../contact/services/contact.service';
import { validationError } from '../../common/services/api-error';
import { buildServiceRequestDescription } from '../domain/service-request';
import type { Service } from '../domain/services';

function readOptional(values: FormData, name: string): string | undefined {
  return String(values.get(name) ?? '').trim() || undefined;
}

export function ServiceRequestForm({ service }: Readonly<{ service: Service }>) {
  const { t } = useTranslation();
  const numerals = useCatalogByCategory(service.catalogCategory);
  const [sent, setSent] = useState(false);

  const submit = useCallback(
    async (values: FormData) => {
      // Mismas reglas que el formulario de contacto (comparten endpoint y campos).
      const details = validateContactForm(readContactForm(values, service.contactType), t);
      if (details.length > 0) throw validationError(details);
      return createContactRequest({
        nombreCompleto: String(values.get('nombreCompleto') ?? '').trim(),
        email: String(values.get('email') ?? '').trim(),
        empresa: readOptional(values, 'empresa'),
        telefono: readOptional(values, 'telefono'),
        tipoProducto: service.contactType,
        descripcionCaso: buildServiceRequestDescription(
          DICTIONARIES.es.services.items[service.slug].title,
          values,
        ),
        montoEstimado: readOptional(values, 'montoEstimado'),
      });
    },
    [service, t],
  );

  const onSuccess = useCallback((_result: unknown, form: HTMLFormElement) => {
    form.reset();
    setSent(true);
  }, []);

  const { handleSubmit, isSubmitting, error, fieldErrors, clearErrors } = useFormAction(submit, {
    onSuccess,
  });

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
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={fieldErrors.nombreCompleto} label={t('contact.fields.fullName')} required>
          {(control) => (
            <Input
              {...control}
              autoComplete="name"
              maxLength={120}
              minLength={2}
              name="nombreCompleto"
            />
          )}
        </Field>
        <Field error={fieldErrors.email} label={t('contact.fields.email')} required>
          {(control) => (
            <Input {...control} autoComplete="email" maxLength={254} name="email" type="email" />
          )}
        </Field>
        <Field error={fieldErrors.empresa} label={t('contact.fields.company')}>
          {(control) => (
            <Input {...control} autoComplete="organization" maxLength={160} name="empresa" />
          )}
        </Field>
        <Field error={fieldErrors.telefono} label={t('contact.fields.phone')}>
          {(control) => (
            <Input {...control} autoComplete="tel" maxLength={40} name="telefono" type="tel" />
          )}
        </Field>
        <Field label={t('services.form.country')}>
          {(control) => <Input {...control} maxLength={100} name="pais" />}
        </Field>
        <Field error={fieldErrors.montoEstimado} label={t('services.form.approxAmount')}>
          {(control) => (
            <Input
              {...control}
              inputMode="decimal"
              min="0"
              name="montoEstimado"
              step="0.01"
              type="number"
            />
          )}
        </Field>
        <Field error={numerals.error ?? undefined} label={t('services.form.numeral')}>
          {(control) => (
            <Select
              {...control}
              disabled={numerals.isLoading || Boolean(numerals.error)}
              name="numeral"
            >
              <option value="">
                {numerals.isLoading
                  ? t('services.form.numeralLoading')
                  : t('services.form.numeralPlaceholder')}
              </option>
              {(numerals.data ?? []).map((item) => (
                <option key={item.id} value={`${item.code} · ${item.title}`}>
                  {item.code} · {item.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field
        error={fieldErrors.descripcionCaso}
        label={t('services.form.caseDescription')}
        required
      >
        {(control) => <Textarea {...control} maxLength={1500} name="descripcionCaso" rows={5} />}
      </Field>

      {error && <Alert>{error}</Alert>}
      {sent && <Alert tone="success">{t('services.form.sent')}</Alert>}
      <div className="flex flex-wrap gap-3">
        <Button isLoading={isSubmitting} type="submit">
          {isSubmitting ? t('services.form.submitting') : t('services.form.submit')}
        </Button>
        {sent && (
          <Link className={buttonStyles({ variant: 'outline' })} href={ROUTES.myRequests}>
            {t('services.form.viewRequests')}
          </Link>
        )}
      </div>
    </form>
  );
}
