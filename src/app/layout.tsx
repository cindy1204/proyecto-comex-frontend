import type { Metadata } from 'next';
import { Archivo, Overpass_Mono, Public_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { SessionProvider } from '@/features/auth/components/session-provider';
import { ThemeScript } from '@/features/common/components/theme-script';
import { I18nProvider } from '@/features/i18n/components/i18n-provider';
import { getTranslations } from '@/features/i18n/services/get-translations';
import { SiteFooter } from '@/features/layout/components/site-footer';
import { SiteHeader } from '@/features/layout/components/site-header';
import './globals.css';

/*
 * Tres familias, cada una con un oficio. Todas de la familia gótica de rótulos y formularios:
 * - Archivo (eje de ancho, usada condensada) para titulares, cifras grandes y la marca.
 * - Public Sans (derivada de Franklin Gothic, hecha para documentos oficiales) para lectura y UI.
 * - Overpass Mono (heredera de la señalética Highway Gothic) solo para numerales, códigos y montos.
 */
const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
});

const text = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public',
});

const mono = Overpass_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-overpass',
});

/**
 * El idioma se resuelve en el servidor (cookie `locale`, luego `Accept-Language`) al leer
 * `cookies()`/`headers()`, lo que vuelve dinámico el layout. `instant = false` desactiva la
 * validación de shell estático de Cache Components para que esa lectura no bloquee el build.
 */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: {
      default: t('meta.siteTitle'),
      template: '%s | ColComex',
    },
    description: t('meta.siteDescription'),
  };
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { locale, t } = await getTranslations();

  return (
    <html
      className={`${display.variable} ${text.variable} ${mono.variable}`}
      data-scroll-behavior="smooth"
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col">
        <I18nProvider locale={locale}>
          <SessionProvider>
            <a
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
              href="#contenido"
            >
              {t('layout.skipToContent')}
            </a>
            <SiteHeader />
            <main className="flex-1" id="contenido">
              {children}
            </main>
            <SiteFooter />
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
