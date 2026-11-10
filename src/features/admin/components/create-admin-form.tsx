'use client';

import { useCallback, useState } from 'react';
import { createAdmin } from '../../auth/services/auth.service';
import { Alert } from '../../common/components/alert';
import { Button } from '../../common/components/button';
import { Field } from '../../common/components/field';
import { Input } from '../../common/components/input';
import { translateIssues } from '../../common/domain/validation';
import { useFormAction } from '../../common/hooks/use-form-action';
import { validationError } from '../../common/services/api-error';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { ADMIN_PASSWORD_MIN_LENGTH, validateCreateAdmin } from '../domain/admin-form';

export function CreateAdminForm() {
  const { t } = useTranslation();
  const [createdName, setCreatedName] = useState<string | null>(null);

  const submit = useCallback(
    async (values: FormData) => {
      const payload = {
        name: String(values.get('name') ?? '').trim(),
        email: String(values.get('email') ?? '').trim(),
        password: String(values.get('password') ?? ''),
      };
      const issues = validateCreateAdmin(payload);
      if (issues.length > 0) throw validationError(translateIssues(issues, t));
      return createAdmin(payload);
    },
    [t],
  );

  const onSuccess = useCallback((user: { name: string }, form: HTMLFormElement) => {
    form.reset();
    setCreatedName(user.name);
  }, []);

  const { handleSubmit, isSubmitting, error, fieldErrors, clearErrors } = useFormAction(submit, {
    onSuccess,
  });

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onInput={() => {
        setCreatedName(null);
        if (error) clearErrors();
      }}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={fieldErrors.name} label={t('auth.fields.name')} required>
          {(control) => (
            <Input {...control} autoComplete="off" maxLength={120} minLength={2} name="name" />
          )}
        </Field>
        <Field error={fieldErrors.email} label={t('auth.fields.email')} required>
          {(control) => (
            <Input {...control} autoComplete="off" maxLength={254} name="email" type="email" />
          )}
        </Field>
      </div>
      <Field
        error={fieldErrors.password}
        hint={t('auth.fields.passwordMinHint', { min: ADMIN_PASSWORD_MIN_LENGTH })}
        label={t('auth.fields.password')}
        required
      >
        {(control) => (
          <Input
            {...control}
            autoComplete="new-password"
            maxLength={128}
            minLength={ADMIN_PASSWORD_MIN_LENGTH}
            name="password"
            type="password"
          />
        )}
      </Field>
      {error && <Alert>{error}</Alert>}
      {createdName && (
        <Alert tone="success">{t('admin.create.success', { name: createdName })}</Alert>
      )}
      <div>
        <Button isLoading={isSubmitting} type="submit">
          {isSubmitting ? t('admin.create.submitting') : t('admin.create.submit')}
        </Button>
      </div>
    </form>
  );
}
