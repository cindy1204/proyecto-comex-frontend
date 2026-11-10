import type { Metadata } from 'next';
import { ProtectedContent } from '@/features/auth/protected-content';
import { AdminDashboard } from '@/features/admin/admin-dashboard';

export const metadata: Metadata = { title: 'Administración' };

export default function AdminPage() {
  return <ProtectedContent requiredRole="admin" returnTo="/admin"><AdminDashboard /></ProtectedContent>;
}
