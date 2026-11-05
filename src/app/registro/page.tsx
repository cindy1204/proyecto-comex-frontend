import type { Metadata } from 'next';
import { AccountForm } from '@/features/auth/account-form';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default function RegisterPage() {
  return <AccountForm mode="register" />;
}
