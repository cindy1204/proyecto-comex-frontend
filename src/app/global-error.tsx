'use client';

import { DICTIONARIES } from '@/features/i18n/dictionaries';

// El layout raíz no está disponible aquí (ni el proveedor de i18n, ni la cookie de idioma, ni los
// estilos globales): se usa el diccionario en español directamente y estilos en línea mínimos.
const { errorPage, common } = DICTIONARIES.es;

const ACTION_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: '0 16px',
  borderRadius: '8px',
  border: '1px solid currentColor',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
} as const;

export default function GlobalError({ retry }: Readonly<{ error: unknown; retry: () => void }>) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.6,
          colorScheme: 'light dark',
        }}
      >
        <main style={{ maxWidth: '36rem' }}>
          <title>{errorPage.title}</title>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 12px' }}>{errorPage.title}</h1>
          <p role="alert" style={{ margin: '0 0 24px' }}>
            {errorPage.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button onClick={() => retry()} style={ACTION_STYLE} type="button">
              {common.retryAgain}
            </button>
            {/* Recarga completa: el router de Next puede no estar disponible en este límite. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={ACTION_STYLE}>
              {common.backHome}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
