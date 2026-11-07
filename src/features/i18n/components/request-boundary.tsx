import { Suspense, type ReactNode } from 'react';
import { connection } from 'next/server';
import { Loading } from '../../common/components/loading';

/**
 * Límite de Suspense para el contenido de una página que depende de la petición (idioma por
 * cookie, datos del backend). Con Cache Components, leer `cookies()`/`headers()` fuera de un
 * `<Suspense>` bloquea la navegación; dentro, el shell estático se sirve al instante y el contenido
 * llega por streaming (el HTML final sigue incluyendo el texto traducido).
 */
export function RequestBoundary({ children }: Readonly<{ children: ReactNode }>) {
  return <Suspense fallback={<Loading className="min-h-[50vh]" />}>{children}</Suspense>;
}

async function Connection() {
  await connection();
  return null;
}

/**
 * Marcador para páginas cuyo cuerpo ya es estático pero cuyos metadatos (`generateMetadata`)
 * leen la cookie de idioma: declara que esa dependencia de la petición es intencional sin
 * sacar nada del shell estático (patrón "dynamic marker" de la documentación de Next.js).
 */
export function DynamicMarker() {
  return (
    <Suspense>
      <Connection />
    </Suspense>
  );
}
