'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  useEffect(() => {
    if (isAdmin && !pathname.startsWith('/admin')) router.replace('/admin');
    if (isUser && !isUserWorkspacePath(pathname)) router.replace('/mis-interacciones');
  }, [isAdmin, isUser, pathname, router]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          className="brand"
          href={isAdmin ? '/admin' : isUser ? '/mis-interacciones' : '/'}
          aria-label={isAdmin ? 'ColComex, administración' : isUser ? 'ColComex, mis solicitudes' : 'ColComex, inicio'}
        >
          <span className="brand-mark">C</span>
          <span>ColComex</span>
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          {isAdmin ? (
            <>
              <Link href="/admin">Administración</Link>
              <Link href="/admin/interacciones">Interacciones</Link>
            </>
          ) : isUser ? (
            <>
              <Link href="/mis-interacciones#formularios">Mis solicitudes</Link>
              <Link href="/mis-interacciones#diligenciar">Diligenciar formularios</Link>
            </>
          ) : (
            <>
              <Link href="/">Inicio</Link>
              <Link href="/#servicios">Servicios</Link>
              <Link href="/contacto">Contáctenos</Link>
              <Link href="/admin">Administrador</Link>
              {user && <Link href="/mis-interacciones">Mis solicitudes</Link>}
            </>
          )}
        </nav>
        <div className="account-nav">
          {loading ? <span className="muted small">Verificando…</span> : user ? (
            <>
              <span className="user-greeting">Hola, {user.name}</span>
              <button className="button button-outline button-small" onClick={logout} type="button">Salir</button>
            </>
          ) : (
            <>
              <Link className="login-link" href="/login">Ingresar</Link>
              <Link className="button button-small" href="/registro">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function isUserWorkspacePath(pathname: string) {
  return pathname === '/mis-interacciones'
    || pathname === '/importaciones'
    || pathname === '/exportaciones'
    || /^\/servicios\/[^/]+\/formulario$/.test(pathname);
}
