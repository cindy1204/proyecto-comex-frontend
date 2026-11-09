import Link from 'next/link';
import { buttonStyles } from '../../common/components/button';
import { Container } from '../../common/components/container';
import { ROUTES } from '../../common/config';
import { getTranslations } from '../../i18n/services/get-translations';
import { ServicesGrid } from '../../services/components/services-grid';

export async function ServicesSection() {
  const { t } = await getTranslations();

  return (
    <section className="scroll-mt-20 py-16" id="servicios">
      <Container>
        <h2 className="type-title text-foreground">{t('home.services.title')}</h2>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          {t('home.services.description')}
        </p>
        <div className="mt-8">
          <ServicesGrid />
        </div>
        <Link
          className={buttonStyles({ variant: 'outline', className: 'mt-6' })}
          href={ROUTES.services}
        >
          {t('home.services.viewAll')}
        </Link>
      </Container>
    </section>
  );
}
