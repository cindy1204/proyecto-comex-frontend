'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useSession } from '../../auth/hooks/use-session';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { Loading } from '../../common/components/loading';
import { ROUTES } from '../../common/config';
import type { UserRole } from '../../common/domain/session';
import { AuthGuard } from './auth-guard';

function RoleCheck({ role, children }: Readonly<{ role: UserRole; children: ReactNode }>) {
  const { user } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const allowed = user?.role === role;

  useEffect(() => {
    if (!allowed) router.replace(ROUTES.home);
  }, [allowed, router]);

  return allowed ? (
    <>{children}</>
  ) : (
    <Loading className="min-h-[50vh]" label={t('common.redirecting')} />
  );
}

/** Exige sesión y un rol concreto (por ejemplo `admin`); otro rol vuelve al inicio. */
export function RoleGuard({ role, children }: Readonly<{ role: UserRole; children: ReactNode }>) {
  return (
    <AuthGuard>
      <RoleCheck role={role}>{children}</RoleCheck>
    </AuthGuard>
  );
}
