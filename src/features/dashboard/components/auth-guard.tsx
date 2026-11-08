'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useSession } from '../../auth/hooks/use-session';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { Loading } from '../../common/components/loading';
import { ROUTES } from '../../common/config';

/**
 * Segunda capa de protección (la primera es `proxy.ts`): cubre tokens vencidos o cookies
 * manipuladas. Nunca pinta el contenido privado mientras no haya una sesión validada.
 */
export function AuthGuard({ children }: Readonly<{ children: ReactNode }>) {
  const { user, isLoading, sessionEnd } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || user) return;
    if (sessionEnd === 'logout') {
      router.replace(ROUTES.home);
      return;
    }
    const params = new URLSearchParams({ returnTo: `${pathname}${window.location.search}` });
    if (sessionEnd === 'expired') params.set('expirada', '1');
    router.replace(`${ROUTES.login}?${params}`);
  }, [isLoading, user, sessionEnd, pathname, router]);

  if (isLoading || !user) {
    return (
      <Loading
        className="min-h-[50vh]"
        label={isLoading ? t('common.verifyingSession') : t('common.redirecting')}
      />
    );
  }
  return <>{children}</>;
}
