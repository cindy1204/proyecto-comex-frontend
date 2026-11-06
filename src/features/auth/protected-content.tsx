'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from './auth-provider';

export function ProtectedContent({
  children,
  requiredRole,
  returnTo = '/mis-interacciones',
}: Readonly<{ children: ReactNode; requiredRole?: 'admin'; returnTo?: string }>) {
  const { user, loading, error, restoreSession } = useAuth();
  const router = useRouter();
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!loading && !error && !user) router.replace(loginHref);
  }, [loading, error, user, router, loginHref]);

  useEffect(() => {
    if (!loading && error?.startsWith('Tu sesión venció')) router.replace(loginHref);
  }, [loading, error, router, loginHref]);

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
  if (!user) return <p className="notice">Debes <Link href={loginHref}>iniciar sesión o crear una cuenta</Link> para continuar.</p>;
  if (requiredRole && user.role !== requiredRole) {
    return <p className="notice notice-error" role="alert">No tienes permisos para ver esta página.</p>;
  }
  return children;
}
