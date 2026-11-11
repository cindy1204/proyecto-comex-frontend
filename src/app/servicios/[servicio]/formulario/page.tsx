import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card } from '@/features/common/components/card';
import { Container } from '@/features/common/components/container';
import { PageHeader } from '@/features/common/components/page-header';
import { AuthGuard } from '@/features/dashboard/components/auth-guard';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';
import { ServiceRequestForm } from '@/features/services/components/service-request-form';
import {
  GENERIC_FORM_SERVICES,
  findService,
  type Service,
} from '@/features/services/domain/services';

type ServiceParams = Promise<{ servicio: string }>;

export function generateStaticParams() {
  return GENERIC_FORM_SERVICES.map(({ slug }) => ({ servicio: slug }));
}

export async function generateMetadata({ params }: { params: ServiceParams }): Promise<Metadata> {
  const { servicio } = await params;
  const service = findService(servicio);
  const { t } = await getTranslations();
  return {
    title: service
      ? t('services.form.metaTitle', {
          service: t(`services.items.${service.slug}.title`).toLowerCase(),
        })
      : t('services.form.fallbackTitle'),
  };
}

async function ServiceFormContent({ service }: { service: Service }) {
  const { t } = await getTranslations();

  return (
    <AuthGuard>
      <Container className="py-10" size="narrow">
        <PageHeader
          description={t('services.form.description')}
          eyebrow={t(`services.items.${service.slug}.title`)}
          title={t('services.form.title')}
        />
        <Card>
          <ServiceRequestForm service={service} />
        </Card>
      </Container>
    </AuthGuard>
  );
}

// notFound() se llama aquí, antes de hacer streaming: así la respuesta es un 404 real y no un 200.
export default async function ServiceFormPage({ params }: { params: ServiceParams }) {
  const { servicio } = await params;
  const service = findService(servicio);
  if (!service?.usesGenericForm) notFound();

  return (
    <RequestBoundary>
      <ServiceFormContent service={service} />
    </RequestBoundary>
  );
}
