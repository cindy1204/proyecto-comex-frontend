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

  const loadContactRequests = useCallback(async (signal: AbortSignal) => {
    if (!token) return;
    try {
      const result = await apiRequest<{ data: ContactRequest[] }>('/api/contacto/mias', { token, signal });
      setItems(result.data);
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
  }, [token, logout, router]);

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
        <h2>Solicitudes de contacto</h2>
        <p>Solicitudes enviadas desde el formulario Contáctenos con tu sesión iniciada.</p>
      </header>
      {loading && <p className="notice">Cargando solicitudes de contacto…</p>}
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="notice">Aún no tienes solicitudes de contacto asociadas a tu cuenta.</p>
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
    </section>
  );
}
