'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-provider';

export function SiteHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="ColComex, inicio">
          <span className="brand-mark">C</span>
          <span>ColComex</span>
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link href="/">Inicio</Link>
          <Link href="/#servicios">Servicios</Link>
          <Link href="/contacto">Contáctenos</Link>
          <Link href="/admin">Administrador</Link>
          {user && <Link href="/mis-interacciones">Mis solicitudes</Link>}
          {user?.role === 'admin' && <Link href="/admin/interacciones">Interacciones</Link>}
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
