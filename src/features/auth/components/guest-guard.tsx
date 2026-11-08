'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { Loading } from '../../common/components/loading';
import { useSession } from '../hooks/use-session';

interface GuestGuardProps {
  /** Ruta interna a la que se envía al usuario con sesión (p. ej. el `returnTo` validado). */
  redirectTo: string;
  children: ReactNode;
}

/** Para login/registro: con sesión activa redirige; también tras iniciar sesión con éxito. */
export function GuestGuard({ redirectTo, children }: Readonly<GuestGuardProps>) {
  const { user } = useSession();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, redirectTo, router]);

  return user ? (
    <Loading className="min-h-[50vh]" label={t('common.redirecting')} />
  ) : (
    <>{children}</>
  );
}
