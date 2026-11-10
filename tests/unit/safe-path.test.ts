import { describe, expect, it } from 'vitest';
import { toOptionalSafePath, toSafeInternalPath } from '@/features/common/utils/safe-path';

describe('toSafeInternalPath', () => {
  it.each([null, undefined, '', 'https://x', 'http://evil.com/a', 'ok', '//evil.com', '/\\evil'])(
    'rechaza %j y devuelve el valor por defecto',
    (value) => {
      expect(toSafeInternalPath(value)).toBe('/');
    },
  );

  it('usa el fallback indicado', () => {
    expect(toSafeInternalPath('//evil.com', '/login')).toBe('/login');
  });

  it('acepta rutas internas conservando query y hash', () => {
    expect(toSafeInternalPath('/ok?x=1')).toBe('/ok?x=1');
    expect(toSafeInternalPath('/catalogo#top')).toBe('/catalogo#top');
    expect(toSafeInternalPath('/')).toBe('/');
  });
});

describe('toOptionalSafePath', () => {
  it('devuelve undefined si no hay destino válido', () => {
    expect(toOptionalSafePath(null)).toBeUndefined();
    expect(toOptionalSafePath(undefined)).toBeUndefined();
    expect(toOptionalSafePath('')).toBeUndefined();
    expect(toOptionalSafePath('https://x')).toBeUndefined();
    expect(toOptionalSafePath('//evil.com')).toBeUndefined();
    expect(toOptionalSafePath('/\\evil')).toBeUndefined();
  });

  it('devuelve la ruta cuando es interna', () => {
    expect(toOptionalSafePath('/ok?x=1')).toBe('/ok?x=1');
  });
});
