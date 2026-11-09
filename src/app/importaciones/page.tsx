import type { Metadata } from 'next';
import { Card } from '@/features/common/components/card';
import { Container } from '@/features/common/components/container';
import { PageHeader } from '@/features/common/components/page-header';
import { AuthGuard } from '@/features/dashboard/components/auth-guard';
import { InteractionForm } from '@/features/interactions/components/interaction-form';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return { title: t('meta.imports') };
}

async function ImportationsPageContent() {
  const { t } = await getTranslations();

  return (
    <AuthGuard>
      <Container className="py-10">
        <PageHeader
          description={t('interactions.pages.imports.description')}
          eyebrow={t('interactions.pages.imports.eyebrow')}
          title={t('interactions.pages.imports.title')}
        />
        <Card>
          <InteractionForm type="formulario-importaciones" />
        </Card>
      </Container>
    </AuthGuard>
  );
}

export default function ImportationsPage() {
  return (
    <RequestBoundary>
      <ImportationsPageContent />
    </RequestBoundary>
  );
}
