import type { TranslateFunction } from '../../i18n/domain/translate';

export type CatalogCategory =
  'importaciones' | 'exportaciones' | 'inversiones' | 'endeudamiento' | 'servicios';

export type CatalogDirection = 'INGRESOS' | 'EGRESOS';

export type CatalogState = 'ACTIVE' | 'REMOVED';

/** Filtro de estado del listado de administración (`ALL` incluye los eliminados). */
export type CatalogStateFilter = CatalogState | 'ALL';

export interface CatalogItem {
  id: string;
  /** Texto libre en el backend; las categorías sembradas están en `CATALOG_CATEGORIES`. */
  category: string;
  direction: CatalogDirection;
  code: string;
  title: string;
  description: string;
  note: string | null;
  imageUrl: string | null;
  state: CatalogState;
  createdAt: string;
  updatedAt: string;
}

/** Filtros de `GET /catalogos`; `state` solo lo respeta el backend para administradores. */
export interface CatalogFilters {
  category?: CatalogCategory | '';
  direction?: CatalogDirection | '';
  search?: string;
  state?: CatalogStateFilter;
  createdFrom?: string;
  createdTo?: string;
}

/** Datos del formulario de alta/edición (el backend recibe `multipart/form-data`). */
export interface CatalogInput {
  category: string;
  direction: CatalogDirection;
  code: string;
  title: string;
  description: string;
  note: string;
  /** Archivo nuevo; `null` conserva la imagen actual (o ninguna al crear). */
  image: File | null;
}

/** Filtros de estado del admin; etiqueta en `catalog.stateFilters.<valor>`. */
export const CATALOG_STATE_FILTERS: readonly CatalogStateFilter[] = ['ACTIVE', 'REMOVED', 'ALL'];

/** Valores técnicos de categoría (se envían al backend); etiqueta en `catalog.categories.<valor>`. */
export const CATALOG_CATEGORIES: readonly CatalogCategory[] = [
  'importaciones',
  'exportaciones',
  'inversiones',
  'endeudamiento',
  'servicios',
];

/** Valores técnicos de dirección; etiqueta en `catalog.directions.<valor>`. */
export const CATALOG_DIRECTIONS: readonly CatalogDirection[] = ['INGRESOS', 'EGRESOS'];

export function isCatalogCategory(value: string): value is CatalogCategory {
  return (CATALOG_CATEGORIES as readonly string[]).includes(value);
}

/** Etiqueta traducida de la categoría; las categorías libres del backend se muestran tal cual. */
export function categoryLabel(category: string, t: TranslateFunction): string {
  return isCatalogCategory(category) ? t(`catalog.categories.${category}`) : category;
}

export function isCatalogDirection(value: string): value is CatalogDirection {
  return value === 'INGRESOS' || value === 'EGRESOS';
}

export function catalogItemPath(id: string): string {
  return `/catalogo/${encodeURIComponent(id)}`;
}
