'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';

const originalHomepageUrl = 'http://localhost:8000/paginappal/index.html';

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <header className={`site-header${isAdminPage ? ' site-header-admin' : ''}`}>
      <div className="header-inner">
        <Link
          className="brand"
          href={isAdminPage ? originalHomepageUrl : '/'}
          aria-label="ColComex, inicio"
        >
          <span className="brand-mark">C</span>
          <span>ColComex</span>
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          {isAdminPage ? (
            <>
              <a href={originalHomepageUrl}>Inicio</a>
              <a href={`${originalHomepageUrl}#servicios`}>Servicios</a>
              <a href={`${originalHomepageUrl}#nosotros`}>Nosotros</a>
              <Link href="/contacto">Contacto</Link>
              <Link href="/admin">Administrador</Link>
            </>
          ) : (
            <>
              <Link href="/">Inicio</Link>
              <Link href="/#servicios">Servicios</Link>
              <Link href="/catalogo">Catálogo</Link>
              <Link href="/importaciones">Importar</Link>
              <Link href="/exportaciones">Exportar</Link>
              <Link href="/contacto">Contáctenos</Link>
              <Link href="/admin">Administrador</Link>
              {user && <Link href="/mis-interacciones">Mis solicitudes</Link>}
              {user?.role === 'admin' && <Link href="/admin/interacciones">Administración</Link>}
            </>
          )}
        </nav>
        {!isAdminPage && (
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
        )}
      </div>
    </header>
  );
}
