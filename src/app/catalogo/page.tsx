import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogBrowser } from '@/features/catalog/catalog-browser';

export const metadata: Metadata = { title: 'Catálogo de numerales' };

export default function CatalogPage() {
  return (
    <section className="section">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Consulta pública</p>
          <h1>Catálogo de numerales</h1>
          <p>Busca numerales por código, categoría o descripción. Filtra los resultados y navega entre páginas.</p>
        </header>
        <Suspense fallback={<p className="notice">Cargando catálogo…</p>}>
          <CatalogBrowser />
        </Suspense>
      </div>
    </section>
  );
}
