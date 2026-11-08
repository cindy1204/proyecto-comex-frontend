import type { FieldError } from '../../common/domain/api-error';
import type { TranslateFunction } from '../../i18n/domain/translate';
import { isCatalogDirection, type CatalogInput } from './catalog';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const IMAGE_MAX_MB = 5;

const LIMITS = { code: 40, title: 250, description: 10000, category: 80 } as const;

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

/** Lee el formulario del catálogo; el archivo vacío (sin selección) se interpreta como `null`. */
export function readCatalogForm(form: FormData): CatalogInput {
  const direction = text(form, 'direction');
  const image = form.get('image');
  return {
    category: text(form, 'category'),
    direction: isCatalogDirection(direction) ? direction : 'INGRESOS',
    code: text(form, 'code'),
    title: text(form, 'title'),
    description: text(form, 'description'),
    note: text(form, 'note'),
    image: image instanceof File && image.size > 0 ? image : null,
  };
}

/** Misma validación que el backend (zod), para responder sin ir a la red. */
export function validateCatalogInput(
  input: CatalogInput,
  form: FormData,
  t: TranslateFunction,
): FieldError[] {
  const errors: FieldError[] = [];
  const required = (field: keyof typeof LIMITS, value: string) => {
    const label = t(`catalog.form.fieldNames.${field}`);
    if (!value)
      errors.push({ field, message: t('catalog.form.errors.required', { field: label }) });
    else if (value.length > LIMITS[field]) {
      errors.push({
        field,
        message: t('catalog.form.errors.tooLong', { field: label, max: LIMITS[field] }),
      });
    }
  };
  required('category', input.category);
  required('code', input.code);
  required('title', input.title);
  required('description', input.description);
  if (!isCatalogDirection(text(form, 'direction'))) {
    errors.push({ field: 'direction', message: t('catalog.form.errors.direction') });
  }
  if (input.image) {
    if (!IMAGE_TYPES.includes(input.image.type)) {
      errors.push({ field: 'image', message: t('catalog.form.errors.imageFormat') });
    } else if (input.image.size > IMAGE_MAX_MB * 1024 * 1024) {
      errors.push({
        field: 'image',
        message: t('catalog.form.errors.imageSize', { max: IMAGE_MAX_MB }),
      });
    }
  }
  return errors;
}
