export interface FieldError {
  field: string;
  message: string;
}

/** Cuerpo de error del contrato: `{ error: { code, message, details? } }`. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: FieldError[];
  };
}

export type FieldErrors = Record<string, string>;
