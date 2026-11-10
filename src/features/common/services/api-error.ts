import type { TranslateFunction, TranslationKey } from '../../i18n/domain/translate';
import type { ApiErrorBody, FieldError, FieldErrors } from '../domain/api-error';

export const NETWORK_ERROR_CODE = 'NETWORK_ERROR';
export const CONFIG_ERROR_CODE = 'CONFIG_ERROR';

/** Mensaje de error por `error.code` del contrato del backend (y los códigos propios del cliente). */
const CODE_MESSAGES: Record<string, TranslationKey> = {
  VALIDATION_ERROR: 'errors.validation',
  BAD_REQUEST: 'errors.badRequest',
  INVALID_JSON: 'errors.badRequest',
  INVALID_UPLOAD: 'errors.invalidUpload',
  INVALID_IMAGE: 'errors.invalidImage',
  UNAUTHORIZED: 'errors.unauthorized',
  INVALID_TOKEN: 'errors.unauthorized',
  INVALID_CREDENTIALS: 'errors.invalidCredentials',
  FORBIDDEN: 'errors.forbidden',
  NOT_FOUND: 'errors.notFound',
  CONFLICT: 'errors.conflict',
  PAYLOAD_TOO_LARGE: 'errors.payloadTooLarge',
  UNSUPPORTED_MEDIA_TYPE: 'errors.unsupportedMediaType',
  RATE_LIMITED: 'errors.rateLimited',
  IMAGE_STORAGE_NOT_CONFIGURED: 'errors.imageStorageNotConfigured',
  IMAGE_UPLOAD_FAILED: 'errors.imageUploadFailed',
  INTERNAL_ERROR: 'errors.server',
  [NETWORK_ERROR_CODE]: 'errors.network',
  [CONFIG_ERROR_CODE]: 'errors.config',
};

/** Respaldo por estado HTTP cuando el cuerpo no trae un código conocido. */
const STATUS_MESSAGES: Record<number, TranslationKey> = {
  400: 'errors.validation',
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.notFound',
  409: 'errors.conflict',
  413: 'errors.payloadTooLarge',
  415: 'errors.unsupportedMediaType',
  429: 'errors.rateLimited',
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldError[];

  constructor(params: { status: number; code: string; message: string; details?: FieldError[] }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details ?? [];
  }

  /** Errores por campo listos para pintarse junto a cada input: `{ email: 'Correo inválido' }`. */
  get fieldErrors(): FieldErrors {
    const errors: FieldErrors = {};
    for (const { field, message } of this.details) {
      const name = field.split('.').pop() ?? field;
      if (!(name in errors)) errors[name] = message;
    }
    return errors;
  }
}

/** Error de validación del cliente: se muestra por campo igual que los `details` del backend. */
export function validationError(details: FieldError[]): ApiError {
  return new ApiError({ status: 400, code: 'VALIDATION_ERROR', message: '', details });
}

export function networkError(): ApiError {
  return new ApiError({
    status: 0,
    code: NETWORK_ERROR_CODE,
    message: 'Network error',
  });
}

export function configError(message: string): ApiError {
  return new ApiError({ status: 0, code: CONFIG_ERROR_CODE, message });
}

/**
 * Convierte cualquier valor lanzado en un mensaje legible en el idioma activo: primero por
 * `error.code` conocido, luego por estado HTTP; los códigos desconocidos (4xx) muestran el
 * mensaje del backend (en español) y el resto, un mensaje genérico traducido.
 */
export function getErrorMessage(error: unknown, t: TranslateFunction): string {
  if (!(error instanceof ApiError)) return t('errors.generic');
  const known = CODE_MESSAGES[error.code];
  if (known) return t(known);
  if (error.status >= 500) return t('errors.server');
  if (error.message) return error.message;
  return t(STATUS_MESSAGES[error.status] ?? 'errors.generic');
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Normaliza una respuesta HTTP fallida (con o sin cuerpo del contrato) en un `ApiError`. */
export function parseApiError(status: number, payload: unknown): ApiError {
  const body = isApiErrorBody(payload) ? payload.error : null;

  return new ApiError({
    status,
    code: body?.code ?? `HTTP_${status}`,
    message: body?.message ?? '',
    details: body ? toFieldErrors(body.details) : [],
  });
}

function toFieldErrors(details: unknown): FieldError[] {
  if (!Array.isArray(details)) return [];
  return details.filter(isFieldError);
}

function isFieldError(value: unknown): value is FieldError {
  return isRecord(value) && typeof value.field === 'string' && typeof value.message === 'string';
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    isRecord(value) &&
    isRecord(value.error) &&
    typeof value.error.code === 'string' &&
    typeof value.error.message === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
