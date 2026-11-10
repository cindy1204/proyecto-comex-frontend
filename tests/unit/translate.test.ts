import { describe, expect, it } from 'vitest';
import { DICTIONARIES } from '@/features/i18n/dictionaries';
import { createTranslator, type TranslationKey } from '@/features/i18n/domain/translate';

const tEs = createTranslator(DICTIONARIES.es, 'es');
const tEn = createTranslator(DICTIONARIES.en, 'en');

describe('createTranslator', () => {
  it('resuelve claves anidadas por idioma', () => {
    expect(tEs('common.cancel')).toBe('Cancelar');
    expect(tEn('common.cancel')).toBe('Cancel');
  });

  it('interpola parámetros y conserva los marcadores que no recibe', () => {
    expect(tEs('catalog.form.errors.required', { field: 'El código' })).toBe(
      'El código es obligatorio.',
    );
    expect(tEs('catalog.form.errors.tooLong', { field: 'El título', max: 250 })).toBe(
      'El título admite máximo 250 caracteres.',
    );
    expect(tEs('catalog.form.errors.tooLong', { field: 'X' })).toBe(
      'X admite máximo {max} caracteres.',
    );
  });

  it('devuelve la propia clave si no existe, o si apunta a un grupo y no a un texto', () => {
    expect(tEs('no.existe' as TranslationKey)).toBe('no.existe');
    expect(tEs('common' as TranslationKey)).toBe('common');
    expect(tEs('common.cancel.mas' as TranslationKey)).toBe('common.cancel.mas');
  });

  it('elige la variante plural según count', () => {
    expect(tEs('common.results', { count: 1 })).toBe('1 resultado');
    expect(tEs('common.results', { count: 0 })).toBe('0 resultados');
    expect(tEs('common.results', { count: 25 })).toBe('25 resultados');
    expect(tEn('common.results', { count: 1 })).toBe('1 result');
    expect(tEn('common.results', { count: 2 })).toBe('2 results');
  });

  it('un count no numérico no activa el plural', () => {
    expect(tEs('common.results' as TranslationKey, { count: '1' })).toBe('common.results');
  });
});
