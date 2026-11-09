import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonStyles } from '@/features/common/components/button';
import { Container } from '@/features/common/components/container';
import { PageHeader } from '@/features/common/components/page-header';
import { ROUTES } from '@/features/common/config';
import { ServicesGrid } from '@/features/services/components/services-grid';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return { title: t('meta.services') };
}

async function ServicesPageContent() {
  const { t } = await getTranslations();

  return (
    <Container className="py-10">
      <PageHeader
        actions={
          <Link className={buttonStyles()} href={ROUTES.contact}>
            {t('services.requestAdvice')}
          </Link>
        }
        description={t('services.page.description')}
        eyebrow={t('services.page.eyebrow')}
        title={t('services.page.title')}
      />
      <ServicesGrid />
    </Container>
  );
}

export default function ServicesPage() {
  return (
    <RequestBoundary>
      <ServicesPageContent />
    </RequestBoundary>
  );
}
