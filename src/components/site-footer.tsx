'use client';

import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
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
