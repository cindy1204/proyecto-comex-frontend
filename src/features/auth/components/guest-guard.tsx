'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { resolvePostAuthPath } from '../../dashboard/domain/routes';
import { Loading } from '../../common/components/loading';
import { useSession } from '../hooks/use-session';

interface GuestGuardProps {
  /** `returnTo` validado. Si falta o el rol no puede abrirlo, aterriza en el espacio de trabajo de su rol. */
  redirectTo?: string;
  children: ReactNode;
}

/** Para login/registro: tras autenticarse redirige al `returnTo` o, si no hay, al aterrizaje del rol. */
export function GuestGuard({ redirectTo, children }: Readonly<GuestGuardProps>) {
  const { user } = useSession();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(resolvePostAuthPath(user.role, redirectTo));
  }, [user, redirectTo, router]);

  return user ? (
    <Loading className="min-h-[50vh]" label={t('common.redirecting')} />
  ) : (
    <>{children}</>
  );
}
