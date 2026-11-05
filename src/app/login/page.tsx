import type { Metadata } from 'next';
import { AccountForm } from '@/features/auth/account-form';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return <AccountForm mode="login" />;
}
