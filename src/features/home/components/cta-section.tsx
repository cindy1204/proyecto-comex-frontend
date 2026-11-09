import Link from 'next/link';
import { buttonStyles } from '../../common/components/button';
import { Container } from '../../common/components/container';
import { ROUTES } from '../../common/config';
import { getTranslations } from '../../i18n/services/get-translations';

export async function CtaSection() {
  const { t } = await getTranslations();

  return (
    <section className="py-16">
      <Container className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-8 py-10 text-primary-foreground sm:flex-row sm:items-center">
        <div>
          <h2 className="type-heading">{t('home.cta.title')}</h2>
          <p className="mt-1 opacity-90">{t('home.cta.description')}</p>
        </div>
        <Link
          className={buttonStyles({ size: 'lg', variant: 'secondary', className: 'shrink-0' })}
          href={ROUTES.contact}
        >
          {t('home.cta.button')}
        </Link>
      </Container>
    </section>
  );
}
