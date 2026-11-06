'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiRequest } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';

interface ContactRequest {
  id: string;
  nombreCompleto: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
  tipoProducto: string;
  descripcionCaso: string;
  createdAt: string;
}

interface ContactRequestsPage {
  data: ContactRequest[];
  pagination: { total: number; currentPage: number; limit: number; totalPages: number };
}

const productLabels: Record<string, string> = {
  importaciones: 'Importaciones de bienes',
  exportaciones: 'Exportaciones de bienes',
  deudaExterna: 'Endeudamiento externo, avales y garantías',
  inversiones: 'Inversiones internacionales',
  servicios: 'Servicios, transferencias y otros conceptos',
};

export function ContactRequestsList() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [tipoProducto, setTipoProducto] = useState('');
  const [pagination, setPagination] = useState<ContactRequestsPage['pagination'] | null>(null);

  const loadContactRequests = useCallback(async (signal: AbortSignal) => {
    if (!token) return;
    try {
      const query = new URLSearchParams({ currentPage: String(page), limit: '10' });
      if (tipoProducto) query.set('tipoProducto', tipoProducto);
      const result = await apiRequest<ContactRequestsPage>(`/api/solicitudes-contacto/mias?${query}`, { token, signal });
      setItems(result.data);
      setPagination(result.pagination);
    } catch (requestError) {
      if (signal.aborted) return;
      if (requestError instanceof ApiError && requestError.status === 401) {
        logout();
        setError('Tu sesión venció. Inicia sesión de nuevo.');
        router.replace('/login');
      } else {
        setError(requestError instanceof Error
          ? requestError.message
          : 'No se pudieron cargar tus solicitudes de contacto.');
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [token, logout, router, page, tipoProducto]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadContactRequests(controller.signal);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadContactRequests]);

  return (
    <section>
      <header className="page-heading">
        <h2>Formularios de servicios y asesorías</h2>
        <p>Consulta los formularios y solicitudes de asesoría asociados a tu cuenta.</p>
      </header>
      <label className="field filter-category">
        <span>Filtrar por servicio</span>
        <select onChange={(event) => { setTipoProducto(event.target.value); setPage(1); setLoading(true); }} value={tipoProducto}>
          <option value="">Todos</option>
          {Object.entries(productLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {loading && <p className="notice">Cargando solicitudes de contacto…</p>}
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="notice">Aún no tienes formularios de servicios ni solicitudes de asesoría asociados a tu cuenta.</p>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="interaction-list">
          {items.map((item) => (
            <article className="interaction-card" key={item.id}>
              <div className="interaction-heading">
                <div>
                  <p className="eyebrow">{productLabels[item.tipoProducto] ?? item.tipoProducto}</p>
                  <h2>{item.nombreCompleto}</h2>
                </div>
                <time dateTime={item.createdAt}>
                  {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}
                </time>
              </div>
              <p className="muted small">
                {item.email}
                {item.telefono ? ` · ${item.telefono}` : ''}
                {item.empresa ? ` · ${item.empresa}` : ''}
              </p>
              <details>
                <summary>Ver descripción del caso</summary>
                <p className="contact-request-description">{item.descripcionCaso}</p>
              </details>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && pagination && (
        <div className="pagination">
          <span>{pagination.total} solicitudes · Página {pagination.currentPage} de {Math.max(pagination.totalPages, 1)}</span>
          <div className="pagination-actions">
            <button className="button button-outline" disabled={page <= 1} onClick={() => { setPage((value) => value - 1); setLoading(true); }} type="button">Anterior</button>
            <button className="button button-outline" disabled={page >= pagination.totalPages} onClick={() => { setPage((value) => value + 1); setLoading(true); }} type="button">Siguiente</button>
          </div>
        </div>
      )}
    </section>
  );
}
