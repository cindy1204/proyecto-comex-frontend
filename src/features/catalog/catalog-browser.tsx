'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';

interface CatalogItem {
  id: string;
  category: string;
  direction: 'INGRESOS' | 'EGRESOS';
  code: string;
  title: string;
  description: string;
  note: string | null;
}

interface CatalogPage {
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  data: CatalogItem[];
}

const categories = [
  ['importaciones', 'Importaciones'],
  ['exportaciones', 'Exportaciones'],
  ['inversiones', 'Inversiones'],
  ['endeudamiento', 'Endeudamiento'],
] as const;

export function CatalogBrowser() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') ?? '';
  const initialFilter = categories.some(([value]) => value === initialCategory) ? initialCategory : '';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialFilter);
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedCategory, setAppliedCategory] = useState(initialFilter);
  const [result, setResult] = useState<CatalogPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), pageSize: '9' });
    if (appliedSearch) query.set('search', appliedSearch);
    if (appliedCategory) query.set('category', appliedCategory);

    apiRequest<CatalogPage>(`/api/catalogo?${query}`, { signal: controller.signal })
      .then(setResult)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el catálogo.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, appliedSearch, appliedCategory]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setPage(1);
    setAppliedSearch(search.trim());
    setAppliedCategory(category);
  }

  const totalPages = result?.pagination.totalPages ?? 0;

  return (
    <div>
      <form className="catalog-filters" onSubmit={applyFilters}>
        <label className="field filter-search">
          <span>Buscar por numeral o descripción</span>
          <input
            maxLength={200}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ej. pago de importaciones"
            value={search}
          />
        </label>
        <label className="field filter-category">
          <span>Categoría</span>
          <select onChange={(event) => setCategory(event.target.value)} value={category}>
            <option value="">Todas las categorías</option>
            {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="button filter-button" type="submit">Buscar</button>
      </form>

      <div aria-live="polite" className="catalog-status">
        {loading && <p className="notice">Cargando numerales…</p>}
        {!loading && error && <p className="notice notice-error" role="alert">{error}</p>}
        {!loading && !error && result?.data.length === 0 && (
          <p className="notice">No encontramos numerales para esos filtros.</p>
        )}
      </div>

      {result && !error && (
        <>
          <div className="catalog-grid">
            {result.data.map((item) => (
              <article className="catalog-card" key={item.id}>
                <div className="catalog-card-top">
                  <span className="catalog-code">{item.code}</span>
                  <span className="catalog-direction">{item.direction === 'INGRESOS' ? 'Ingreso' : 'Egreso'}</span>
                </div>
                <p className="eyebrow">{item.category}</p>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                {item.note && <p className="catalog-note">{item.note}</p>}
              </article>
            ))}
          </div>
          <div className="pagination">
            <span>
              {result.pagination.total} resultados · Página {result.pagination.page} de {Math.max(totalPages, 1)}
            </span>
            <div className="pagination-actions">
              <button
                className="button button-outline"
                disabled={loading || page <= 1}
                onClick={() => {
                  setLoading(true);
                  setError('');
                  setPage((current) => current - 1);
                }}
                type="button"
              >
                Anterior
              </button>
              <button
                className="button button-outline"
                disabled={loading || page >= totalPages}
                onClick={() => {
                  setLoading(true);
                  setError('');
                  setPage((current) => current + 1);
                }}
                type="button"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
