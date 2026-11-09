'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useSession } from '../../auth/hooks/use-session';
import { Button, buttonStyles } from '../../common/components/button';
import { ROUTES } from '../../common/config';
import { useTranslation } from '../../i18n/hooks/use-translation';

export function AccountActions() {
  const { user, isLoading, logout } = useSession();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div aria-hidden="true" className="h-11 w-40 animate-pulse rounded-lg bg-surface-muted" />
    );
  }

  if (user) {
    return (
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-3">
        <span className="max-w-48 truncate text-sm text-muted-foreground xl:hidden">
          {t('layout.greeting', { name: user.name })}
        </span>
        <Button onClick={logout} size="sm" variant="outline">
          <LogOut aria-hidden="true" className="size-4" />
          {t('layout.logout')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
      <Link className={buttonStyles({ variant: 'outline', size: 'sm' })} href={ROUTES.login}>
        {t('layout.login')}
      </Link>
      <Link className={buttonStyles({ size: 'sm' })} href={ROUTES.register}>
        {t('layout.register')}
      </Link>
    </div>
  );
}
