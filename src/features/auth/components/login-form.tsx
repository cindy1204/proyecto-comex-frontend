'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Alert } from '../../common/components/alert';
import { Button } from '../../common/components/button';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { Field } from '../../common/components/field';
import { Input } from '../../common/components/input';
import { PasswordInput } from '../../common/components/password-input';
import { ROUTES } from '../../common/config';
import { useFormAction } from '../../common/hooks/use-form-action';
import { translateIssues } from '../../common/domain/validation';
import { validationError } from '../../common/services/api-error';
import { toOptionalSafePath } from '../../common/utils/safe-path';
import { validateLogin } from '../domain/auth-form';
import { useSession } from '../hooks/use-session';
import { AuthCard } from './auth-card';
import { GuestGuard } from './guest-guard';

export function LoginForm() {
  const searchParams = useSearchParams();
  const returnTo = toOptionalSafePath(searchParams.get('returnTo'));
  const sessionExpired = searchParams.get('expirada') === '1';
  const { login } = useSession();
  const { t } = useTranslation();

  const action = useCallback(
    async (values: FormData) => {
      const credentials = {
        email: String(values.get('email') ?? '').trim(),
        password: String(values.get('password') ?? ''),
      };
      const issues = validateLogin(credentials);
      if (issues.length > 0) throw validationError(translateIssues(issues, t));
      return login(credentials);
    },
    [login, t],
  );
  const { handleSubmit, isSubmitting, error, fieldErrors } = useFormAction(action);

  const registerHref = returnTo
    ? `${ROUTES.register}?returnTo=${encodeURIComponent(returnTo)}`
    : ROUTES.register;

  return (
    <GuestGuard redirectTo={returnTo}>
      <AuthCard
        description={t('auth.login.description')}
        eyebrow={t('auth.login.eyebrow')}
        footer={
          <>
            {t('auth.login.noAccount')}{' '}
            <Link
              className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
              href={registerHref}
            >
              {t('auth.login.registerLink')}
            </Link>
          </>
        }
        title={t('auth.login.title')}
      >
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          {sessionExpired && !error && (
            <Alert tone="warning">{t('auth.login.sessionExpired')}</Alert>
          )}
          {error && <Alert>{error}</Alert>}
          <Field error={fieldErrors.email} label={t('auth.fields.email')} required>
            {(control) => (
              <Input {...control} autoComplete="email" maxLength={254} name="email" type="email" />
            )}
          </Field>
          <Field error={fieldErrors.password} label={t('auth.fields.password')} required>
            {(control) => (
              <PasswordInput
                {...control}
                autoComplete="current-password"
                maxLength={128}
                name="password"
              />
            )}
          </Field>
          <Button fullWidth isLoading={isSubmitting} type="submit">
            {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </form>
      </AuthCard>
    </GuestGuard>
  );
}
