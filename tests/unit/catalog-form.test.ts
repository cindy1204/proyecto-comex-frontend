import { describe, expect, it } from 'vitest';
import type { CatalogInput } from '@/features/catalog/domain/catalog';
import {
  IMAGE_MAX_MB,
  readCatalogForm,
  validateCatalogInput,
} from '@/features/catalog/domain/catalog-form';
import { DICTIONARIES } from '@/features/i18n/dictionaries';
import { createTranslator } from '@/features/i18n/domain/translate';

const t = createTranslator(DICTIONARIES.es, 'es');

const VALID = {
  category: 'importaciones',
  direction: 'INGRESOS',
  code: '1.1',
  title: 'Importación de bienes',
  description: 'Descripción del numeral',
  note: '',
} as const;

function buildForm(overrides: Record<string, string | File> = {}): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...VALID, ...overrides })) form.set(key, value);
  return form;
}

function validate(overrides: Record<string, string | File> = {}) {
  const form = buildForm(overrides);
  const input: CatalogInput = readCatalogForm(form);
  return validateCatalogInput(input, form, t);
}

const fields = (errors: { field: string }[]) => errors.map((e) => e.field);

describe('validateCatalogInput', () => {
  it('un formulario válido no produce errores', () => {
    expect(validate()).toEqual([]);
  });

  it.each(['category', 'code', 'title', 'description'])(
    'el campo %s vacío o solo con espacios es obligatorio',
    (field) => {
      expect(fields(validate({ [field]: '' }))).toEqual([field]);
      expect(fields(validate({ [field]: '   ' }))).toEqual([field]);
    },
  );

  it('el mensaje de obligatorio usa el nombre traducido del campo', () => {
    expect(validate({ code: '' })[0].message).toBe('El código es obligatorio.');
  });

  it.each([
    ['code', 40],
    ['title', 250],
    ['description', 10000],
    ['category', 80],
  ])('%s admite hasta %i caracteres y rechaza uno más', (field, max) => {
    expect(validate({ [field]: 'a'.repeat(max) })).toEqual([]);
    const errors = validate({ [field]: 'a'.repeat(max + 1) });
    expect(fields(errors)).toEqual([field]);
    expect(errors[0].message).toContain(String(max));
  });

  it('una dirección inválida se informa en direction', () => {
    expect(fields(validate({ direction: 'OTRA' }))).toEqual(['direction']);
    expect(fields(validate({ direction: '' }))).toEqual(['direction']);
  });

  it('acepta EGRESOS', () => {
    expect(validate({ direction: 'EGRESOS' })).toEqual([]);
  });

  it('acepta imágenes JPG, PNG y WebP dentro del límite', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validate({ image: new File(['x'], 'a', { type }) })).toEqual([]);
    }
  });

  it('rechaza formatos de imagen no permitidos', () => {
    const errors = validate({ image: new File(['x'], 'a.gif', { type: 'image/gif' }) });
    expect(fields(errors)).toEqual(['image']);
    expect(errors[0].message).toBe('Formato no permitido. Usa JPG, PNG o WebP.');
  });

  it('rechaza imágenes por encima del máximo y acepta justo el máximo', () => {
    const limit = IMAGE_MAX_MB * 1024 * 1024;
    const exact = new File([new Uint8Array(limit)], 'a.png', { type: 'image/png' });
    const over = new File([new Uint8Array(limit + 1)], 'a.png', { type: 'image/png' });
    expect(validate({ image: exact })).toEqual([]);
    const errors = validate({ image: over });
    expect(fields(errors)).toEqual(['image']);
    expect(errors[0].message).toContain(`${IMAGE_MAX_MB} MB`);
  });

  it('acumula los errores de varios campos', () => {
    expect(fields(validate({ code: '', title: '', direction: 'X' }))).toEqual([
      'code',
      'title',
      'direction',
    ]);
  });
});

describe('readCatalogForm', () => {
  it('recorta espacios y trata el archivo vacío como sin imagen', () => {
    const form = buildForm({ title: '  Título  ', image: new File([], 'vacio.png') });
    const input = readCatalogForm(form);
    expect(input.title).toBe('Título');
    expect(input.image).toBeNull();
  });

  it('una dirección desconocida se lee como INGRESOS (la validación la reporta aparte)', () => {
    expect(readCatalogForm(buildForm({ direction: 'OTRA' })).direction).toBe('INGRESOS');
  });
});
