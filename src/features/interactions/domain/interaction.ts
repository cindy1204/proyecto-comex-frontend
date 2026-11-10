import type { CatalogCategory } from '../../catalog/domain/catalog';
import type { TranslateFunction } from '../../i18n/domain/translate';

export type InteractionType = 'formulario-importaciones' | 'formulario-exportaciones';

export interface Interaction {
  id: string;
  userId: string;
  catalogItemId: string;
  type: InteractionType;
  data: Record<string, unknown>;
  state: 'ACTIVE' | 'REMOVED';
  createdAt: string;
  updatedAt: string;
  catalogItem: { id: string; category: string; code: string; title: string };
  /** El backend solo lo incluye para administradores. */
  user?: { id: string; name: string; email: string };
}

export interface CreateInteractionPayload {
  type: InteractionType;
  data: Record<string, string>;
}

/** Cambios de `PUT /interacciones/:id`: el backend fusiona `data` con lo ya guardado. */
export interface UpdateInteractionPayload {
  data: Record<string, string>;
}

export interface InteractionFilters {
  type?: InteractionType | '';
  /** Solo administradores (`GET /interacciones`). */
  userId?: string;
  createdFrom?: string;
  createdTo?: string;
}

/** Texto legible de un valor de `data` (los valores pueden ser cualquier JSON). */
export function formatDataValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/** Etiqueta legible del tipo técnico (el valor enviado al backend no cambia). */
export function interactionLabel(type: InteractionType, t: TranslateFunction): string {
  return t(`interactions.types.${type}`);
}

export function isInteractionType(value: string): value is InteractionType {
  return value === 'formulario-importaciones' || value === 'formulario-exportaciones';
}

export interface OperationConfig {
  category: CatalogCategory;
  /** Nombre del campo donde el backend espera el numeral. */
  numeralField: 'numeralOperacion' | 'numeralCambiario';
}

export const OPERATIONS: Record<InteractionType, OperationConfig> = {
  'formulario-importaciones': { category: 'importaciones', numeralField: 'numeralOperacion' },
  'formulario-exportaciones': { category: 'exportaciones', numeralField: 'numeralCambiario' },
};
