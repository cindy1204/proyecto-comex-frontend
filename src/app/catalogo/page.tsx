import type { Metadata } from 'next';
import { CatalogBrowser } from '@/features/catalog/components/catalog-browser';
import { Container } from '@/features/common/components/container';
import { PageHeader } from '@/features/common/components/page-header';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return { title: t('meta.catalog') };
}

async function CatalogPageContent() {
  const { t } = await getTranslations();

  return (
    <Container className="py-10">
      <PageHeader
        description={t('catalog.page.description')}
        eyebrow={t('catalog.page.eyebrow')}
        title={t('catalog.page.title')}
      />
      <CatalogBrowser />
    </Container>
  );
}

export default function CatalogPage() {
  return (
    <RequestBoundary>
      <CatalogPageContent />
    </RequestBoundary>
  );
}
