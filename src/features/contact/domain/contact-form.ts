import type { FieldError } from '../../common/domain/api-error';
import type { TranslateFunction } from '../../i18n/domain/translate';
import {
  isContactProductType,
  type ContactProductType,
  type CreateContactPayload,
  type UpdateContactPayload,
} from './contact';

const LIMITS = {
  nombreCompleto: 120,
  email: 254,
  empresa: 160,
  telefono: 40,
  descripcionCaso: 2000,
} as const;

const MAX_INTEGER_DIGITS = 12;
const AMOUNT_PATTERN = new RegExp(`^\\d{1,${MAX_INTEGER_DIGITS}}(\\.\\d{1,2})?$`);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactFormValues {
  nombreCompleto: string;
  email: string;
  empresa: string;
  telefono: string;
  tipoProducto: ContactProductType;
  descripcionCaso: string;
  montoEstimado: string;
}

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function readContactForm(
  form: FormData,
  fallbackType: ContactProductType,
): ContactFormValues {
  const productType = text(form, 'tipoProducto');
  return {
    nombreCompleto: text(form, 'nombreCompleto'),
    email: text(form, 'email'),
    empresa: text(form, 'empresa'),
    telefono: text(form, 'telefono'),
    tipoProducto: isContactProductType(productType) ? productType : fallbackType,
    descripcionCaso: text(form, 'descripcionCaso'),
    montoEstimado: text(form, 'montoEstimado'),
  };
}

/** Misma validación que el backend (zod), para responder sin ir a la red. */
export function validateContactForm(values: ContactFormValues, t: TranslateFunction): FieldError[] {
  const errors: FieldError[] = [];
  const check = (field: Exclude<keyof typeof LIMITS, 'email'>, min: number) => {
    const value = values[field];
    const label = t(`contact.validation.fieldNames.${field}`);
    if (value.length < min) {
      errors.push({
        field,
        message:
          min === 1
            ? t('contact.validation.required', { field: label })
            : t('contact.validation.minLength', { field: label, min }),
      });
    } else if (value.length > LIMITS[field]) {
      errors.push({
        field,
        message: t('contact.validation.maxLength', { field: label, max: LIMITS[field] }),
      });
    }
  };
  check('nombreCompleto', 2);
  check('descripcionCaso', 1);
  check('empresa', 0);
  check('telefono', 0);
  if (!values.email)
    errors.push({ field: 'email', message: t('contact.validation.emailRequired') });
  else if (!EMAIL_PATTERN.test(values.email) || values.email.length > LIMITS.email) {
    errors.push({ field: 'email', message: t('contact.validation.emailInvalid') });
  }
  if (values.montoEstimado && !AMOUNT_PATTERN.test(values.montoEstimado)) {
    errors.push({ field: 'montoEstimado', message: t('contact.validation.amountInvalid') });
  }
  return errors;
}

export function toCreatePayload(values: ContactFormValues): CreateContactPayload {
  return {
    nombreCompleto: values.nombreCompleto,
    email: values.email,
    empresa: values.empresa || undefined,
    telefono: values.telefono || undefined,
    tipoProducto: values.tipoProducto,
    descripcionCaso: values.descripcionCaso,
    montoEstimado: values.montoEstimado || undefined,
  };
}

export function toUpdatePayload(values: ContactFormValues): UpdateContactPayload {
  return {
    nombreCompleto: values.nombreCompleto,
    email: values.email,
    empresa: values.empresa || null,
    telefono: values.telefono || null,
    tipoProducto: values.tipoProducto,
    descripcionCaso: values.descripcionCaso,
    montoEstimado: values.montoEstimado || null,
  };
}
