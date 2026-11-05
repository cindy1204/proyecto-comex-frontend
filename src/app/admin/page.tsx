import type { Metadata } from 'next';
import { AdminDashboard } from '@/features/admin/admin-dashboard';

export const metadata: Metadata = { title: 'Administración' };

export default function AdminPage() {
  return <AdminDashboard />;
}
