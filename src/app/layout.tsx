import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { AuthProvider } from '@/features/auth/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ColComex | Comercio exterior',
    template: '%s | ColComex',
  },
  description: 'Asesoría y herramientas para tus operaciones de comercio exterior.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="es">
      <body>
        <AuthProvider>
          <SiteHeader />
          <main className="page-main">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
