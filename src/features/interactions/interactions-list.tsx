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

export function InteractionsList({ admin = false }: Readonly<{ admin?: boolean }>) {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInteractions = useCallback(async (signal: AbortSignal) => {
    if (!token) return;
    try {
      const result = await apiRequest<{ data: Interaction[] }>(
        admin ? '/api/interaccion' : '/api/interaccion/mias',
        { token, signal },
      );
      setItems(result.data);
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
  }, [token, admin, logout, router]);

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
  if (items.length === 0) return <p className="notice">Aún no hay solicitudes para mostrar.</p>;

  return (
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
  );
}
