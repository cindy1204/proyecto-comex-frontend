import Link from 'next/link';
import { buttonStyles } from '@/features/common/components/button';
import { Container } from '@/features/common/components/container';
import { ROUTES } from '@/features/common/config';
import { getTranslations } from '@/features/i18n/services/get-translations';

export default async function NotFound() {
  const { t } = await getTranslations();

  return (
    <Container className="py-20 text-center" size="narrow">
      <p className="type-eyebrow text-primary">{t('notFound.eyebrow')}</p>
      <h1 className="mt-3 type-display text-foreground">{t('notFound.title')}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('notFound.description')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className={buttonStyles()} href={ROUTES.home}>
          {t('common.backHome')}
        </Link>
        <Link className={buttonStyles({ variant: 'outline' })} href={ROUTES.catalog}>
          {t('notFound.viewCatalog')}
        </Link>
      </div>
    </Container>
  );
}
