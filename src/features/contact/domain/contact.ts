import type { TranslateFunction } from '../../i18n/domain/translate';

export type ContactProductType =
  'importaciones' | 'exportaciones' | 'deudaExterna' | 'inversiones' | 'servicios';

export interface ContactRequest {
  id: string;
  nombreCompleto: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
  tipoProducto: ContactProductType;
  descripcionCaso: string;
  /** Monto en USD que devuelve el backend como cadena decimal (p. ej. "1500.00"). */
  montoEstimado: string | null;
  /** `null` cuando la envió una persona sin sesión. */
  userId: string | null;
  state: 'ACTIVE' | 'REMOVED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactPayload {
  nombreCompleto: string;
  email: string;
  empresa?: string;
  telefono?: string;
  tipoProducto: ContactProductType;
  descripcionCaso: string;
  montoEstimado?: string;
}

/** Cambios de `PUT /solicitudes-contacto/:id`: `null` borra un campo opcional. */
export interface UpdateContactPayload {
  nombreCompleto: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
  tipoProducto: ContactProductType;
  descripcionCaso: string;
  montoEstimado: string | null;
}

export interface ContactFilters {
  tipoProducto?: ContactProductType | '';
  /** Solo administradores. */
  search?: string;
  createdFrom?: string;
  createdTo?: string;
}

/** Valores técnicos del tipo de producto; etiqueta en `contact.productTypes.<valor>`. */
export const CONTACT_PRODUCT_TYPES: readonly ContactProductType[] = [
  'importaciones',
  'exportaciones',
  'deudaExterna',
  'inversiones',
  'servicios',
];

export function isContactProductType(value: string | null): value is ContactProductType {
  return (CONTACT_PRODUCT_TYPES as readonly (string | null)[]).includes(value);
}

export function contactProductLabel(type: ContactProductType, t: TranslateFunction): string {
  return t(`contact.productTypes.${type}`);
}
