import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  isLocale,
  parseAcceptLanguage,
  resolveLocale,
} from '@/features/i18n/domain/locale';

describe('isLocale', () => {
  it('acepta solo los idiomas soportados', () => {
    expect(isLocale('es')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('ES')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(1)).toBe(false);
  });
});

describe('parseAcceptLanguage', () => {
  it('devuelve null sin cabecera o sin idiomas soportados', () => {
    expect(parseAcceptLanguage(null)).toBeNull();
    expect(parseAcceptLanguage(undefined)).toBeNull();
    expect(parseAcceptLanguage('')).toBeNull();
    expect(parseAcceptLanguage('fr-FR,de;q=0.8')).toBeNull();
  });

  it('usa la región solo como pista y la ignora', () => {
    expect(parseAcceptLanguage('en-US')).toBe('en');
    expect(parseAcceptLanguage('es-CO')).toBe('es');
    expect(parseAcceptLanguage('EN-gb')).toBe('en');
  });

  it('respeta los pesos q por encima del orden', () => {
    expect(parseAcceptLanguage('en;q=0.5,es;q=0.9')).toBe('es');
    expect(parseAcceptLanguage('en-US,en;q=0.9,es;q=0.8')).toBe('en');
  });

  it('con el mismo peso gana el que aparece primero', () => {
    expect(parseAcceptLanguage('es,en')).toBe('es');
    expect(parseAcceptLanguage('en,es')).toBe('en');
  });

  it('ignora q=0 y pesos inválidos', () => {
    expect(parseAcceptLanguage('en;q=0,es;q=0.1')).toBe('es');
    expect(parseAcceptLanguage('en;q=abc')).toBeNull();
    expect(parseAcceptLanguage('fr,en;q=0.2')).toBe('en');
  });
});

describe('resolveLocale', () => {
  it('la cookie válida gana sobre Accept-Language', () => {
    expect(resolveLocale({ cookie: 'en', acceptLanguage: 'es' })).toBe('en');
  });

  it('una cookie inválida cae a Accept-Language', () => {
    expect(resolveLocale({ cookie: 'fr', acceptLanguage: 'en-US' })).toBe('en');
  });

  it('sin nada utilizable devuelve el idioma por defecto', () => {
    expect(resolveLocale({})).toBe(DEFAULT_LOCALE);
    expect(resolveLocale({ cookie: null, acceptLanguage: 'de' })).toBe(DEFAULT_LOCALE);
    expect(DEFAULT_LOCALE).toBe('es');
  });
});
