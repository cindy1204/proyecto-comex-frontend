import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card } from '@/features/common/components/card';
import { Container } from '@/features/common/components/container';
import { PageHeader } from '@/features/common/components/page-header';
import { AuthGuard } from '@/features/dashboard/components/auth-guard';
import type { DeclarationType } from '@/features/interactions/domain/interaction';
import { InteractionForm } from '@/features/interactions/components/interaction-form';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';
import {
  DECLARATION_SERVICES,
  findService,
  type Service,
} from '@/features/services/domain/services';

type ServiceParams = Promise<{ servicio: string }>;

export function generateStaticParams() {
  return DECLARATION_SERVICES.map(({ slug }) => ({ servicio: slug }));
}

export async function generateMetadata({ params }: { params: ServiceParams }): Promise<Metadata> {
  const { servicio } = await params;
  const service = findService(servicio);
  const { t } = await getTranslations();
  return {
    title: service
      ? t('services.declaration.metaTitle', {
          service: t(`services.items.${service.slug}.title`).toLowerCase(),
        })
      : t('services.declaration.fallbackTitle'),
  };
}

async function ServiceDeclarationContent({
  service,
  type,
}: {
  service: Service;
  type: DeclarationType;
}) {
  const { t } = await getTranslations();

  return (
    <AuthGuard>
      <Container className="py-10">
        <PageHeader
          description={t('services.declaration.description')}
          eyebrow={t(`services.items.${service.slug}.title`)}
          title={t('services.declaration.title')}
        />
        <Card>
          <InteractionForm type={type} />
        </Card>
      </Container>
    </AuthGuard>
  );
}

// notFound() se llama aquí, antes de hacer streaming: así la respuesta es un 404 real y no un 200.
export default async function ServiceDeclarationPage({ params }: { params: ServiceParams }) {
  const { servicio } = await params;
  const service = findService(servicio);
  const type = service?.declarationType;
  if (!service || !type) notFound();

  return (
    <RequestBoundary>
      <ServiceDeclarationContent service={service} type={type} />
    </RequestBoundary>
  );
}
