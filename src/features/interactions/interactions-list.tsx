'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiRequest } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';

interface Interaction {
  id: string;
  type: string;
  createdAt: string;
  data: Record<string, unknown>;
  catalogItem: { id: string; category: string; code: string; title: string };
  user?: { id: string; name: string; email: string };
}

interface InteractionsPage {
  data: Interaction[];
  pagination: { total: number; currentPage: number; limit: number; totalPages: number };
}

export function InteractionsList({ admin = false }: Readonly<{ admin?: boolean }>) {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [pagination, setPagination] = useState<InteractionsPage['pagination'] | null>(null);

  const loadInteractions = useCallback(async (signal: AbortSignal) => {
    if (!token) return;
    try {
      const query = new URLSearchParams({ currentPage: String(page), limit: '10' });
      if (type) query.set('type', type);
      const result = await apiRequest<InteractionsPage>(
        `${admin ? '/api/interacciones' : '/api/interacciones/mias'}?${query}`,
        { token, signal },
      );
      setItems(result.data);
      setPagination(result.pagination);
    } catch (requestError) {
      if (signal.aborted) return;
      if (requestError instanceof ApiError && requestError.status === 401) {
        logout();
        setError('Tu sesión venció. Inicia sesión de nuevo.');
        router.replace('/login');
      } else {
        setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar las solicitudes.');
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [token, admin, logout, router, page, type]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadInteractions(controller.signal);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadInteractions]);

  if (loading) return <p className="notice">Cargando solicitudes…</p>;
  if (error) return <p className="notice notice-error" role="alert">{error}</p>;
  if (items.length === 0) {
    return (
      <>
        <InteractionFilters type={type} onTypeChange={(value) => { setType(value); setPage(1); setLoading(true); }} />
        <p className="notice">Aún no hay solicitudes para mostrar.</p>
      </>
    );
  }

  return (
    <>
      <InteractionFilters type={type} onTypeChange={(value) => { setType(value); setPage(1); setLoading(true); }} />
      <div className="interaction-list">
        {items.map((item) => (
          <article className="interaction-card" key={item.id}>
            <div className="interaction-heading">
              <div>
                <p className="eyebrow">{item.type === 'formulario-importaciones' ? 'Importación' : 'Exportación'}</p>
                <h2>{item.catalogItem.code} · {item.catalogItem.title}</h2>
              </div>
              <time dateTime={item.createdAt}>
                {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}
              </time>
            </div>
            {item.user && <p className="muted small">Solicitante: {item.user.name} · {item.user.email}</p>}
            <details>
              <summary>Ver datos enviados</summary>
              <pre className="data-preview">{JSON.stringify(item.data, null, 2)}</pre>
            </details>
          </article>
        ))}
      </div>
      {pagination && (
        <div className="pagination">
          <span>{pagination.total} solicitudes · Página {pagination.currentPage} de {Math.max(pagination.totalPages, 1)}</span>
          <div className="pagination-actions">
            <button className="button button-outline" disabled={page <= 1} onClick={() => { setPage((value) => value - 1); setLoading(true); }} type="button">Anterior</button>
            <button className="button button-outline" disabled={page >= pagination.totalPages} onClick={() => { setPage((value) => value + 1); setLoading(true); }} type="button">Siguiente</button>
          </div>
        </div>
      )}
    </>
  );
}

function InteractionFilters({ type, onTypeChange }: Readonly<{ type: string; onTypeChange: (value: string) => void }>) {
  return (
    <label className="field filter-category">
      <span>Filtrar por formulario</span>
      <select onChange={(event) => onTypeChange(event.target.value)} value={type}>
        <option value="">Todos</option>
        <option value="formulario-importaciones">Importaciones</option>
        <option value="formulario-exportaciones">Exportaciones</option>
      </select>
    </label>
  );
}
