import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { Loading } from '@/features/common/components/loading';
import { DynamicMarker } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return { title: t('meta.login') };
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={<Loading className="min-h-[50vh]" />}>
        <LoginForm />
      </Suspense>
      <DynamicMarker />
    </>
  );
}
