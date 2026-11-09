import type { Metadata } from 'next';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';
import { RoleGuard } from '@/features/dashboard/components/role-guard';
import { DynamicMarker } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return { title: t('meta.adminInteractions') };
}

export default function AdminInteractionsPage() {
  return (
    <>
      <RoleGuard role="admin">
        <AdminDashboard initialTab="interacciones" />
      </RoleGuard>
      <DynamicMarker />
    </>
  );
}
