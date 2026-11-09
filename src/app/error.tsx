'use client';

import Link from 'next/link';
import { Alert } from '@/features/common/components/alert';
import { Button, buttonStyles } from '@/features/common/components/button';
import { Container } from '@/features/common/components/container';
import { ROUTES } from '@/features/common/config';
import { useTranslation } from '@/features/i18n/hooks/use-translation';

export default function ErrorPage({ retry }: Readonly<{ error: unknown; retry: () => void }>) {
  const { t } = useTranslation();

  return (
    <Container className="py-20" size="narrow">
      <h1 className="type-title text-foreground">{t('errorPage.title')}</h1>
      <Alert className="mt-6" title={t('errorPage.alertTitle')}>
        {t('errorPage.description')}
      </Alert>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>{t('common.retryAgain')}</Button>
        <Link className={buttonStyles({ variant: 'outline' })} href={ROUTES.home}>
          {t('common.backHome')}
        </Link>
      </div>
    </Container>
  );
}
