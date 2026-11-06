import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountForm } from '@/features/auth/account-form';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return <Suspense fallback={<p className="notice">Cargando acceso…</p>}><AccountForm mode="login" /></Suspense>;
}
