'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiRequest } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';

interface CatalogItem {
  id: string;
  category: string;
  code: string;
  title: string;
  imageUrl: string | null;
}

interface CatalogPage {
  data: CatalogItem[];
  pagination: { currentPage: number; totalPages: number; total: number };
}

export function CatalogImageManager() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [pagination, setPagination] = useState<CatalogPage['pagination'] | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const loadCatalog = useCallback(async (signal: AbortSignal) => {
    try {
      const query = new URLSearchParams({ currentPage: String(page), limit: '10' });
      if (appliedSearch) query.set('search', appliedSearch);
      const result = await apiRequest<CatalogPage>(`/api/catalogos?${query}`, { signal });
      setItems(result.data);
      setPagination(result.pagination);
      setSelectedId((current) => result.data.some((item) => item.id === current)
        ? current
        : result.data[0]?.id ?? '');
    } catch (error) {
      if (signal.aborted) return;
      setMessage({
        text: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.',
        success: false,
      });
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [page, appliedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadCatalog(controller.signal);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadCatalog]);

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedId || !file) return;
    const form = event.currentTarget;
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append('image', file);
      const result = await apiRequest<{ data: CatalogItem }>(
        `/api/catalogos/${encodeURIComponent(selectedId)}/imagen`,
        { method: 'POST', token, body },
      );
      setItems((current) => current.map((item) => item.id === result.data.id ? result.data : item));
      setFile(null);
      form.reset();
      setMessage({ text: 'Imagen subida y URL guardada en la base de datos.', success: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        router.replace('/login?returnTo=%2Fadmin');
        return;
      }
      setMessage({
        text: error instanceof Error ? error.message : 'No se pudo subir la imagen.',
        success: false,
      });
    } finally {
      setUploading(false);
    }
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPage(1);
    setAppliedSearch(search.trim());
  }

  const selectedItem = items.find((item) => item.id === selectedId);

  return (
    <section className="admin-register-section">
      <header className="page-heading">
        <p className="eyebrow">Almacenamiento</p>
        <h2>Imágenes del catálogo</h2>
        <p>Sube una imagen JPG, PNG o WebP de hasta 5 MB. Se guardará en Supabase Storage y su URL quedará asociada al numeral.</p>
      </header>
      <form className="catalog-filters" onSubmit={applySearch}>
        <label className="field filter-search">
          <span>Buscar numeral</span>
          <input maxLength={200} onChange={(event) => setSearch(event.target.value)} value={search} />
        </label>
        <button className="button filter-button" type="submit">Buscar</button>
      </form>
      {loading && <p className="notice">Cargando numerales…</p>}
      {!loading && items.length === 0 && <p className="notice">No hay numerales activos para mostrar.</p>}
      {!loading && items.length > 0 && (
        <form className="form-card form-stack" onSubmit={uploadImage}>
          <label className="field">
            <span>Numeral del catálogo</span>
            <select onChange={(event) => setSelectedId(event.target.value)} value={selectedId}>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.code} · {item.title}</option>
              ))}
            </select>
          </label>
          {selectedItem?.imageUrl && (
            <p className="small">
              Ya tiene una imagen: <a href={selectedItem.imageUrl} rel="noreferrer" target="_blank">abrir imagen actual</a>
            </p>
          )}
          <label className="field">
            <span>Archivo de imagen</span>
            <input
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
              type="file"
            />
          </label>
          {message && (
            <p className={`form-message ${message.success ? 'form-message-success' : 'form-message-error'}`} role={message.success ? 'status' : 'alert'}>
              {message.text}
            </p>
          )}
          <button className="button" disabled={uploading || !file || !token} type="submit">
            {uploading ? 'Subiendo imagen…' : 'Subir y guardar imagen'}
          </button>
        </form>
      )}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <span>{pagination.total} numerales · Página {pagination.currentPage} de {pagination.totalPages}</span>
          <div className="pagination-actions">
            <button className="button button-outline" disabled={page <= 1} onClick={() => { setPage((value) => value - 1); setLoading(true); }} type="button">Anterior</button>
            <button className="button button-outline" disabled={page >= pagination.totalPages} onClick={() => { setPage((value) => value + 1); setLoading(true); }} type="button">Siguiente</button>
          </div>
        </div>
      )}
    </section>
  );
}
