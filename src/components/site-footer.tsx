'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-provider';

export function SiteFooter() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="brand brand-light" href={isAdmin ? '/admin' : isUser ? '/mis-interacciones' : '/'}>
          <span className="brand-mark">C</span>
          <span>ColComex</span>
        </Link>
        <p>Asesoría para que tus operaciones internacionales avancen con claridad.</p>
        <span>© ColComex</span>
      </div>
    </footer>
  );
}
