'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiRequest } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';

type CatalogDirection = 'INGRESOS' | 'EGRESOS';

interface CatalogItem {
  id: string;
  category: string;
  direction: CatalogDirection;
  code: string;
  title: string;
  description: string;
  note: string | null;
  imageUrl: string | null;
}

interface CatalogPage {
  data: CatalogItem[];
  pagination: { currentPage: number; totalPages: number; total: number };
}

interface CatalogDraft {
  category: string;
  direction: CatalogDirection;
  code: string;
  title: string;
  description: string;
  note: string;
}

const categories = [
  ['importaciones', 'Importaciones'],
  ['exportaciones', 'Exportaciones'],
  ['inversiones', 'Inversiones'],
  ['endeudamiento', 'Endeudamiento'],
  ['servicios', 'Servicios y transferencias'],
] as const;

const emptyDraft: CatalogDraft = {
  category: 'importaciones',
  direction: 'INGRESOS',
  code: '',
  title: '',
  description: '',
  note: '',
};

export function CatalogManagement() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const imageInput = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [pagination, setPagination] = useState<CatalogPage['pagination'] | null>(null);
  const [draft, setDraft] = useState<CatalogDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CatalogItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const loadCatalog = useCallback(async (signal: AbortSignal) => {
    setError('');
    try {
      const query = new URLSearchParams({ currentPage: String(page), limit: '10' });
      if (appliedSearch) query.set('search', appliedSearch);
      const result = await apiRequest<CatalogPage>(`/api/catalogos?${query}`, { signal });
      setItems(result.data);
      setPagination(result.pagination);
    } catch (requestError) {
      if (signal.aborted) return;
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el catálogo.');
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
  }, [loadCatalog, refreshKey]);

  function handleRequestError(requestError: unknown, fallback: string) {
    if (requestError instanceof ApiError && requestError.status === 401) {
      logout();
      router.replace('/login?returnTo=%2Fadmin');
      return;
    }
    setMessage({
      text: requestError instanceof Error ? requestError.message : fallback,
      success: false,
    });
  }

  function startEditing(item: CatalogItem) {
    setEditingId(item.id);
    setDraft({
      category: item.category,
      direction: item.direction,
      code: item.code,
      title: item.title,
      description: item.description,
      note: item.note ?? '',
    });
    setImageFile(null);
    setMessage(null);
    if (imageInput.current) imageInput.current.value = '';
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
    setImageFile(null);
    setMessage(null);
    if (imageInput.current) imageInput.current.value = '';
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setMessage(null);
    const itemId = editingId;
    try {
      const result = await apiRequest<{ data: CatalogItem }>(
        itemId ? `/api/catalogos/${encodeURIComponent(itemId)}` : '/api/catalogos',
        {
          method: itemId ? 'PUT' : 'POST',
          token,
          body: {
            ...draft,
            code: draft.code.trim(),
            title: draft.title.trim(),
            description: draft.description.trim(),
            note: draft.note.trim() || null,
          },
        },
      );
      let savedItem = result.data;
      let imageUploadMessage: string | null = null;
      if (imageFile) {
        const body = new FormData();
        body.append('image', imageFile);
        try {
          const imageResult = await apiRequest<{ data: CatalogItem }>(
            `/api/catalogos/${encodeURIComponent(savedItem.id)}/imagen`,
            { method: 'POST', token, body },
          );
          savedItem = imageResult.data;
        } catch (imageError) {
          if (imageError instanceof ApiError && imageError.status === 401) {
            handleRequestError(imageError, 'No se pudo subir la imagen.');
            return;
          }
          imageUploadMessage = `El numeral se guardó, pero no se pudo subir la imagen: ${imageError instanceof Error ? imageError.message : 'inténtalo de nuevo.'}`;
        }
      }

      setItems((current) => {
        const exists = current.some((item) => item.id === savedItem.id);
        return exists
          ? current.map((item) => item.id === savedItem.id ? savedItem : item)
          : [savedItem, ...current].slice(0, 10);
      });
      setMessage(imageUploadMessage
        ? { text: imageUploadMessage, success: false }
        : { text: itemId ? 'Numeral actualizado correctamente.' : 'Numeral creado correctamente.', success: true });
      if (!itemId && page !== 1) setPage(1);
      setRefreshKey((key) => key + 1);
      setEditingId(null);
      setDraft(emptyDraft);
      setImageFile(null);
      if (imageInput.current) imageInput.current.value = '';
    } catch (requestError) {
      handleRequestError(requestError, 'No se pudo guardar el numeral.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem() {
    if (!token || !pendingDelete) return;
    setDeleting(true);
    setMessage(null);
    try {
      await apiRequest<void>(`/api/catalogos/${encodeURIComponent(pendingDelete.id)}`, {
        method: 'DELETE',
        token,
      });
      if (editingId === pendingDelete.id) {
        setEditingId(null);
        setDraft(emptyDraft);
        setImageFile(null);
        if (imageInput.current) imageInput.current.value = '';
      }
      setPendingDelete(null);
      setMessage({ text: 'Numeral eliminado del catálogo.', success: true });
      if (items.length === 1 && page > 1) setPage((value) => Math.max(1, value - 1));
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      handleRequestError(requestError, 'No se pudo eliminar el numeral.');
    } finally {
      setDeleting(false);
    }
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPage(1);
    setAppliedSearch(search.trim());
  }

  function selectImage(file: File | undefined) {
    setMessage(null);
    if (file && file.size > 5 * 1024 * 1024) {
      setImageFile(null);
      if (imageInput.current) imageInput.current.value = '';
      setMessage({ text: 'La imagen no puede superar los 5 MB.', success: false });
      return;
    }
    setImageFile(file ?? null);
  }

  return (
    <section className="admin-register-section catalog-management">
      <header className="page-heading">
        <p className="eyebrow">Administración</p>
        <h2>Gestión del catálogo</h2>
        <p>Crea y actualiza numerales, agrega imágenes y retira elementos sin borrar su historial.</p>
      </header>

      <form className="form-card form-stack" onSubmit={saveItem}>
        <h3>{editingId ? 'Editar numeral' : 'Crear numeral'}</h3>
        <div className="form-grid">
          <label className="field">
            <span>Categoría</span>
            <select onChange={(event) => setDraft({ ...draft, category: event.target.value })} required value={draft.category}>
              {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Dirección</span>
            <select onChange={(event) => setDraft({ ...draft, direction: event.target.value as CatalogDirection })} required value={draft.direction}>
              <option value="INGRESOS">Ingresos</option>
              <option value="EGRESOS">Egresos</option>
            </select>
          </label>
          <label className="field">
            <span>Código del numeral</span>
            <input maxLength={40} onChange={(event) => setDraft({ ...draft, code: event.target.value })} required value={draft.code} />
          </label>
          <label className="field">
            <span>Título</span>
            <input maxLength={250} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required value={draft.title} />
          </label>
        </div>
        <label className="field">
          <span>Descripción</span>
          <textarea maxLength={10000} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required value={draft.description} />
        </label>
        <label className="field">
          <span>Nota (opcional)</span>
          <textarea maxLength={10000} onChange={(event) => setDraft({ ...draft, note: event.target.value })} value={draft.note} />
        </label>
        <label className="field">
          <span>Imagen JPG, PNG o WebP (opcional, máximo 5 MB)</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => selectImage(event.target.files?.[0])}
            ref={imageInput}
            type="file"
          />
        </label>
        {message && (
          <p className={`form-message ${message.success ? 'form-message-success' : 'form-message-error'}`} role={message.success ? 'status' : 'alert'}>
            {message.text}
          </p>
        )}
        <div className="catalog-management-actions">
          <button className="button" disabled={saving || !token} type="submit">
            {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear numeral'}
          </button>
          {editingId && <button className="button button-outline" disabled={saving} onClick={resetForm} type="button">Cancelar edición</button>}
        </div>
      </form>

      <div className="catalog-management-list">
        <h3>Numerales activos</h3>
        <form className="catalog-filters" onSubmit={applySearch}>
          <label className="field filter-search">
            <span>Buscar por código, título o descripción</span>
            <input maxLength={200} onChange={(event) => setSearch(event.target.value)} value={search} />
          </label>
          <button className="button filter-button" type="submit">Buscar</button>
        </form>

        {error && (
          <div className="notice notice-error" role="alert">
            <p>{error}</p>
            <button className="button button-outline" onClick={() => { setLoading(true); setRefreshKey((key) => key + 1); }} type="button">Reintentar</button>
          </div>
        )}
        {loading && <p className="notice" role="status">Cargando numerales…</p>}
        {!loading && !error && items.length === 0 && <p className="notice">No hay numerales activos para mostrar.</p>}

        {!loading && !error && items.length > 0 && (
          <div className="catalog-grid">
            {items.map((item) => (
              <article className="catalog-card catalog-admin-card" key={item.id}>
                <div className="catalog-card-top">
                  <span className="catalog-code">{item.code}</span>
                  <span className="catalog-direction">{item.direction === 'INGRESOS' ? 'Ingreso' : 'Egreso'}</span>
                </div>
                <p className="eyebrow">{item.category}</p>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                {item.note && <p className="catalog-note">{item.note}</p>}
                {item.imageUrl && <a className="catalog-image-link" href={item.imageUrl} rel="noreferrer" target="_blank">Ver imagen</a>}
                <div className="catalog-management-actions">
                  <button className="button button-outline button-small" onClick={() => startEditing(item)} type="button">Editar</button>
                  <button className="button button-outline button-small" onClick={() => setPendingDelete(item)} type="button">Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <span>{pagination.total} numerales · Página {pagination.currentPage} de {pagination.totalPages}</span>
            <div className="pagination-actions">
              <button className="button button-outline" disabled={page <= 1} onClick={() => { setPage((value) => value - 1); setLoading(true); }} type="button">Anterior</button>
              <button className="button button-outline" disabled={page >= pagination.totalPages} onClick={() => { setPage((value) => value + 1); setLoading(true); }} type="button">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {pendingDelete && (
        <div aria-labelledby="catalog-delete-title" aria-modal="true" className="catalog-delete-confirmation" role="alertdialog">
          <div>
            <h3 id="catalog-delete-title">¿Eliminar el numeral {pendingDelete.code}?</h3>
            <p>Se ocultará del catálogo público, pero el registro y sus relaciones se conservarán.</p>
            <div className="catalog-management-actions">
              <button className="button button-outline" disabled={deleting} onClick={() => setPendingDelete(null)} type="button">Cancelar</button>
              <button className="button" disabled={deleting} onClick={() => void deleteItem()} type="button">
                {deleting ? 'Eliminando…' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
