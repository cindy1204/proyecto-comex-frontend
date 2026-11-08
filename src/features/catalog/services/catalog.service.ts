import type { PageQuery, ResponseItem, ResponseList } from '../../common/domain/pagination';
import { MAX_PAGE_SIZE } from '../../common/config';
import { ApiError } from '../../common/services/api-error';
import { apiRequest } from '../../common/services/http';
import type { CatalogCategory, CatalogFilters, CatalogInput, CatalogItem } from '../domain/catalog';

export function listCatalog(
  filters: CatalogFilters,
  { page, limit }: PageQuery,
  signal?: AbortSignal,
): Promise<ResponseList<CatalogItem>> {
  return apiRequest<ResponseList<CatalogItem>>('/catalogos', {
    query: { page, limit, ...filters },
    signal,
  });
}

/** Recorre todas las páginas de una categoría (el backend limita `limit` a `MAX_PAGE_SIZE`). */
export async function listCatalogByCategory(
  category: CatalogCategory,
  signal?: AbortSignal,
): Promise<CatalogItem[]> {
  const items: CatalogItem[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const response = await listCatalog({ category }, { page, limit: MAX_PAGE_SIZE }, signal);
    items.push(...response.data);
    totalPages = response.pagination.totalPages;
    page += 1;
  }
  return items;
}

/**
 * Detalle público de un numeral. Devuelve `null` si no existe (404), para que la página llame a
 * `notFound()`. Se ejecuta en el servidor, por eso no envía credenciales (`auth: false`).
 */
export async function getPublicCatalogItem(id: string): Promise<CatalogItem | null> {
  try {
    const response = await apiRequest<ResponseItem<CatalogItem>>(
      `/catalogos/${encodeURIComponent(id)}`,
      { auth: false },
    );
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Alta/edición usan `multipart/form-data`: el archivo viaja en el campo `image`. */
function toFormData(input: CatalogInput): FormData {
  const body = new FormData();
  body.set('category', input.category);
  body.set('direction', input.direction);
  body.set('code', input.code);
  body.set('title', input.title);
  body.set('description', input.description);
  body.set('note', input.note);
  if (input.image) body.set('image', input.image);
  return body;
}

export async function createCatalogItem(input: CatalogInput): Promise<CatalogItem> {
  const response = await apiRequest<ResponseItem<CatalogItem>>('/catalogos', {
    method: 'POST',
    body: toFormData(input),
  });
  return response.data;
}

export async function updateCatalogItem(id: string, input: CatalogInput): Promise<CatalogItem> {
  const response = await apiRequest<ResponseItem<CatalogItem>>(
    `/catalogos/${encodeURIComponent(id)}`,
    { method: 'PUT', body: toFormData(input) },
  );
  return response.data;
}

/** Eliminación lógica: el backend responde 204 y el registro queda en estado `REMOVED`. */
export async function removeCatalogItem(id: string): Promise<void> {
  await apiRequest<null>(`/catalogos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** Restaura un registro eliminado: el único cambio de estado permitido es `state: "ACTIVE"`. */
export async function restoreCatalogItem(id: string): Promise<CatalogItem> {
  const response = await apiRequest<ResponseItem<CatalogItem>>(
    `/catalogos/${encodeURIComponent(id)}`,
    { method: 'PUT', body: { state: 'ACTIVE' } },
  );
  return response.data;
}
