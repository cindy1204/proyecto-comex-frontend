'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Alert } from '../../common/components/alert';
import { Button } from '../../common/components/button';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { Field } from '../../common/components/field';
import { Input } from '../../common/components/input';
import { ROUTES } from '../../common/config';
import { useFormAction } from '../../common/hooks/use-form-action';
import { translateIssues } from '../../common/domain/validation';
import { validationError } from '../../common/services/api-error';
import { toOptionalSafePath } from '../../common/utils/safe-path';
import { PASSWORD_MIN_LENGTH, validateRegister } from '../domain/auth-form';
import { useSession } from '../hooks/use-session';
import { AuthCard } from './auth-card';
import { GuestGuard } from './guest-guard';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const returnTo = toOptionalSafePath(searchParams.get('returnTo'));
  const { register } = useSession();
  const { t } = useTranslation();

  const action = useCallback(
    async (values: FormData) => {
      const payload = {
        name: String(values.get('name') ?? '').trim(),
        email: String(values.get('email') ?? '').trim(),
        password: String(values.get('password') ?? ''),
      };
      const issues = validateRegister({
        ...payload,
        confirmPassword: String(values.get('confirmPassword') ?? ''),
      });
      if (issues.length > 0) throw validationError(translateIssues(issues, t));
      return register(payload);
    },
    [register, t],
  );
  const { handleSubmit, isSubmitting, error, fieldErrors } = useFormAction(action);

  const loginHref = returnTo
    ? `${ROUTES.login}?returnTo=${encodeURIComponent(returnTo)}`
    : ROUTES.login;

  return (
    <GuestGuard redirectTo={returnTo}>
      <AuthCard
        description={t('auth.register.description')}
        eyebrow={t('auth.register.eyebrow')}
        footer={
          <>
            {t('auth.register.haveAccount')}{' '}
            <Link
              className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
              href={loginHref}
            >
              {t('auth.register.loginLink')}
            </Link>
          </>
        }
        title={t('auth.register.title')}
      >
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}
          <Field error={fieldErrors.name} label={t('auth.fields.name')} required>
            {(control) => (
              <Input {...control} autoComplete="name" maxLength={120} minLength={2} name="name" />
            )}
          </Field>
          <Field error={fieldErrors.email} label={t('auth.fields.email')} required>
            {(control) => (
              <Input {...control} autoComplete="email" maxLength={254} name="email" type="email" />
            )}
          </Field>
          <Field
            error={fieldErrors.password}
            hint={t('auth.fields.passwordMinHint', { min: PASSWORD_MIN_LENGTH })}
            label={t('auth.fields.password')}
            required
          >
            {(control) => (
              <Input
                {...control}
                autoComplete="new-password"
                maxLength={128}
                minLength={PASSWORD_MIN_LENGTH}
                name="password"
                type="password"
              />
            )}
          </Field>
          <Field
            error={fieldErrors.confirmPassword}
            label={t('auth.fields.confirmPassword')}
            required
          >
            {(control) => (
              <Input
                {...control}
                autoComplete="new-password"
                maxLength={128}
                name="confirmPassword"
                type="password"
              />
            )}
          </Field>
          <Button fullWidth isLoading={isSubmitting} type="submit">
            {isSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
          </Button>
        </form>
      </AuthCard>
    </GuestGuard>
  );
}
