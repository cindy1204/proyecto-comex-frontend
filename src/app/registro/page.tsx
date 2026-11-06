import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountForm } from '@/features/auth/account-form';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default function RegisterPage() {
  return <Suspense fallback={<p className="notice">Cargando registro…</p>}><AccountForm mode="register" /></Suspense>;
}
