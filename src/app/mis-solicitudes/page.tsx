import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonStyles } from '@/features/common/components/button';
import { Container } from '@/features/common/components/container';
import { PageHeader } from '@/features/common/components/page-header';
import { ROUTES } from '@/features/common/config';
import { ContactRequestsList } from '@/features/contact/components/contact-requests-list';
import { AuthGuard } from '@/features/dashboard/components/auth-guard';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return { title: t('meta.myRequests') };
}

async function MyRequestsPageContent() {
  const { t } = await getTranslations();

  return (
    <AuthGuard>
      <Container className="py-10">
        <PageHeader
          actions={
            <Link className={buttonStyles()} href={ROUTES.contact}>
              {t('contact.pages.mine.newRequest')}
            </Link>
          }
          description={t('contact.pages.mine.description')}
          eyebrow={t('common.yourAccount')}
          title={t('contact.pages.mine.title')}
        />
        <ContactRequestsList scope="mine" />
      </Container>
    </AuthGuard>
  );
}

export default function MyRequestsPage() {
  return (
    <RequestBoundary>
      <MyRequestsPageContent />
    </RequestBoundary>
  );
}
