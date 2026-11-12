import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonStyles } from '@/features/common/components/button';
import { Container } from '@/features/common/components/container';
import { PageHeader } from '@/features/common/components/page-header';
import { ROUTES } from '@/features/common/config';
import { ServiceNumerals } from '@/features/services/components/service-numerals';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';
import { SERVICES, findService } from '@/features/services/domain/services';

type ServiceParams = Promise<{ servicio: string }>;

export function generateStaticParams() {
  return SERVICES.map(({ slug }) => ({ servicio: slug }));
}

export async function generateMetadata({ params }: { params: ServiceParams }): Promise<Metadata> {
  const { servicio } = await params;
  const { t } = await getTranslations();
  const service = findService(servicio);
  return {
    title: service ? t(`services.items.${service.slug}.title`) : t('services.fallbackTitle'),
  };
}

async function ServiceContent({ params }: { params: ServiceParams }) {
  const { servicio } = await params;
  const service = findService(servicio);
  if (!service) notFound();
  const { t } = await getTranslations();

  return (
    <Container className="py-10">
      <PageHeader
        actions={
          <>
            <Link className={buttonStyles()} href={service.formHref}>
              {t('services.fillForm')}
            </Link>
            {service.declarationType && (
              <Link
                className={buttonStyles({ variant: 'outline' })}
                href={`/servicios/${service.slug}/declaracion`}
              >
                {t('services.fillDeclaration')}
              </Link>
            )}
            <Link
              className={buttonStyles({ variant: 'outline' })}
              href={`${ROUTES.contact}?tipoProducto=${service.contactType}`}
            >
              {t('services.requestAdvice')}
            </Link>
          </>
        }
        description={t(`services.items.${service.slug}.description`)}
        eyebrow={t('services.detail.eyebrow')}
        title={t(`services.items.${service.slug}.title`)}
      />
      <section aria-labelledby="numerales" className="flex flex-col gap-4">
        <h2 className="type-heading text-foreground" id="numerales">
          {t('services.detail.numeralsTitle')}
        </h2>
        <ServiceNumerals service={service} />
      </section>
    </Container>
  );
}

export default function ServicePage({ params }: { params: ServiceParams }) {
  return (
    <RequestBoundary>
      <ServiceContent params={params} />
    </RequestBoundary>
  );
}
