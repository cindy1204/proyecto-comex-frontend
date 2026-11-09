import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonStyles } from '@/features/common/components/button';
import { Container } from '@/features/common/components/container';
import { PageHeader } from '@/features/common/components/page-header';
import { ROUTES } from '@/features/common/config';
import { AuthGuard } from '@/features/dashboard/components/auth-guard';
import { InteractionsList } from '@/features/interactions/components/interactions-list';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return { title: t('meta.myInteractions') };
}

async function MyInteractionsPageContent() {
  const { t } = await getTranslations();

  return (
    <AuthGuard>
      <Container className="py-10">
        <PageHeader
          actions={
            <Link className={buttonStyles()} href={ROUTES.services}>
              {t('interactions.pages.mine.fillForm')}
            </Link>
          }
          description={t('interactions.pages.mine.description')}
          eyebrow={t('common.yourAccount')}
          title={t('interactions.pages.mine.title')}
        />
        <InteractionsList scope="mine" />
        <p className="mt-8 text-sm text-muted-foreground">
          {t('interactions.pages.mine.lookingForRequests')}{' '}
          <Link
            className="inline-flex min-h-11 items-center font-semibold text-primary underline"
            href={ROUTES.myRequests}
          >
            {t('interactions.pages.mine.goToRequests')}
          </Link>
          .
        </p>
      </Container>
    </AuthGuard>
  );
}

export default function MyInteractionsPage() {
  return (
    <RequestBoundary>
      <MyInteractionsPageContent />
    </RequestBoundary>
  );
}
