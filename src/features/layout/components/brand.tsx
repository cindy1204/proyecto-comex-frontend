'use client';

import Link from 'next/link';
import { ROUTES } from '../../common/config';
import { useTranslation } from '../../i18n/hooks/use-translation';

export function Brand() {
  const { t } = useTranslation();

  return (
    <Link
      aria-label={t('layout.brandLabel')}
      className="flex min-h-11 items-center gap-2 type-brand text-foreground"
      href={ROUTES.home}
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-lg bg-primary type-brand text-primary-foreground"
      >
        C
      </span>
      ColComex
    </Link>
  );
}
