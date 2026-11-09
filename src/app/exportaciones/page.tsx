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
  return { title: t('meta.exports') };
}

async function ExportationsPageContent() {
  const { t } = await getTranslations();

  return (
    <AuthGuard>
      <Container className="py-10">
        <PageHeader
          description={t('interactions.pages.exports.description')}
          eyebrow={t('interactions.pages.exports.eyebrow')}
          title={t('interactions.pages.exports.title')}
        />
        <Card>
          <InteractionForm type="formulario-exportaciones" />
        </Card>
      </Container>
    </AuthGuard>
  );
}

export default function ExportationsPage() {
  return (
    <RequestBoundary>
      <ExportationsPageContent />
    </RequestBoundary>
  );
}
