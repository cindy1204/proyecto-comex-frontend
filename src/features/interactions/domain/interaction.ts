import type { CatalogCategory } from '../../catalog/domain/catalog';
import type { TranslateFunction } from '../../i18n/domain/translate';

/**
 * Declaraciones de cambio de servicios, inversiones y endeudamiento. Comparten un mismo núcleo de
 * datos mínimos (DCIP-83 Anexo 1) y se diligencian en una hoja propia, no en un formulario oficial.
 */
export const DECLARATION_TYPES = [
  'formulario-servicios',
  'formulario-inversiones',
  'formulario-endeudamiento',
] as const;

export type DeclarationType = (typeof DECLARATION_TYPES)[number];

export const INTERACTION_TYPES = [
  'formulario-importaciones',
  'formulario-exportaciones',
  ...DECLARATION_TYPES,
] as const;

export type InteractionType = (typeof INTERACTION_TYPES)[number];

export function isDeclarationType(type: InteractionType): type is DeclarationType {
  return (DECLARATION_TYPES as readonly InteractionType[]).includes(type);
}

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
  return (INTERACTION_TYPES as readonly string[]).includes(value);
}

export interface OperationConfig {
  category: CatalogCategory;
  /** Nombre del campo donde el backend espera el numeral. */
  numeralField: 'numeralOperacion' | 'numeralCambiario';
}

export const OPERATIONS: Record<InteractionType, OperationConfig> = {
  'formulario-importaciones': { category: 'importaciones', numeralField: 'numeralOperacion' },
  'formulario-exportaciones': { category: 'exportaciones', numeralField: 'numeralCambiario' },
  'formulario-servicios': { category: 'servicios', numeralField: 'numeralCambiario' },
  'formulario-inversiones': { category: 'inversiones', numeralField: 'numeralCambiario' },
  'formulario-endeudamiento': { category: 'endeudamiento', numeralField: 'numeralCambiario' },
};
