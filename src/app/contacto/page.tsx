import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card } from '@/features/common/components/card';
import { Container } from '@/features/common/components/container';
import { Loading } from '@/features/common/components/loading';
import { PageHeader } from '@/features/common/components/page-header';
import { ContactForm } from '@/features/contact/components/contact-form';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return { title: t('meta.contact') };
}

async function ContactPageContent() {
  const { t } = await getTranslations();

  return (
    <Container className="py-10" size="narrow">
      <PageHeader
        description={t('contact.page.description')}
        eyebrow={t('contact.page.eyebrow')}
        title={t('contact.page.title')}
      />
      <Card>
        <Suspense fallback={<Loading />}>
          <ContactForm />
        </Suspense>
      </Card>
    </Container>
  );
}

export default function ContactPage() {
  return (
    <RequestBoundary>
      <ContactPageContent />
    </RequestBoundary>
  );
}
