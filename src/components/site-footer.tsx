'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteFooter() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <footer className={`site-footer${isAdminPage ? ' site-footer-admin' : ''}`}>
      <div className="footer-inner">
        <Link className="brand brand-light" href="/">
          <span className="brand-mark">C</span>
          <span>ColComex</span>
        </Link>
        <p>Asesoría para que tus operaciones internacionales avancen con claridad.</p>
        <span>© ColComex</span>
      </div>
    </footer>
  );
}
