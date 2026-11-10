import type {
  TranslateFunction,
  TranslationKey,
  TranslationParams,
} from '../../i18n/domain/translate';
import type { FieldError } from './api-error';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_MAX_LENGTH = 254;

/**
 * Problema de validación puro (sin idioma): el dominio devuelve la clave i18n y el componente o
 * hook la traduce con `translateIssues`, de modo que las reglas se prueban sin diccionarios.
 */
export interface ValidationIssue {
  field: string;
  key: TranslationKey;
  params?: TranslationParams;
}

export function isValidEmail(value: string): boolean {
  return value.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(value);
}

/** Correo obligatorio y con formato válido; devuelve cero o un problema para `field`. */
export function validateEmail(value: string, field = 'email'): ValidationIssue[] {
  if (!value) return [{ field, key: 'validation.emailRequired' }];
  if (!isValidEmail(value)) return [{ field, key: 'validation.emailInvalid' }];
  return [];
}

/** Traduce los problemas a `FieldError[]` (el formato de `details` del backend). */
export function translateIssues(issues: ValidationIssue[], t: TranslateFunction): FieldError[] {
  return issues.map(({ field, key, params }) => ({ field, message: t(key, params) }));
}
