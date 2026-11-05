'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from './auth-provider';

export function ProtectedContent({
  children,
  requiredRole,
}: Readonly<{ children: ReactNode; requiredRole?: 'admin' }>) {
  const { user, loading, error, restoreSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !error && !user) router.replace('/login');
  }, [loading, error, user, router]);

  useEffect(() => {
    if (!loading && error?.startsWith('Tu sesión venció')) router.replace('/login');
  }, [loading, error, router]);

  if (loading) return <p className="notice">Cargando tu sesión…</p>;
  if (error) {
    return (
      <div className="notice notice-error" role="alert">
        <p>{error}</p>
        <button className="button button-outline" onClick={() => void restoreSession()} type="button">
          Volver a intentar
        </button>
      </div>
    );
  }
  if (!user) return <p className="notice">Debes <Link href="/login">iniciar sesión</Link> para continuar.</p>;
  if (requiredRole && user.role !== requiredRole) {
    return <p className="notice notice-error" role="alert">No tienes permisos para ver esta página.</p>;
  }
  return children;
}
