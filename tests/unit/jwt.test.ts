import { describe, expect, it } from 'vitest';
import { decodeJwtPayload, isJwtExpired } from '@/features/common/utils/jwt';

function tokenWith(payload: object): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.firma`;
}

const NOW = 1_700_000_000_000;
const nowSeconds = NOW / 1000;

describe('isJwtExpired', () => {
  it('un token con exp futuro está vigente', () => {
    expect(isJwtExpired(tokenWith({ exp: nowSeconds + 60 }), NOW)).toBe(false);
  });

  it('un token con exp pasado está vencido', () => {
    expect(isJwtExpired(tokenWith({ exp: nowSeconds - 1 }), NOW)).toBe(true);
  });

  it('vence exactamente en el instante exp', () => {
    expect(isJwtExpired(tokenWith({ exp: nowSeconds }), NOW)).toBe(true);
  });

  it('un token sin exp o con exp no numérico se considera vencido', () => {
    expect(isJwtExpired(tokenWith({ sub: 'u1' }), NOW)).toBe(true);
    expect(isJwtExpired(tokenWith({ exp: String(nowSeconds + 60) }), NOW)).toBe(true);
  });

  it.each(['', 'abc', 'a.b.c', 'a..c', 'a.%%%.c'])('un token malformado (%j) está vencido', (t) => {
    expect(isJwtExpired(t, NOW)).toBe(true);
  });

  it('usa la hora actual si no se inyecta nowMs', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isJwtExpired(tokenWith({ exp: future }))).toBe(false);
  });
});

describe('decodeJwtPayload', () => {
  it('decodifica base64url con caracteres no ASCII', () => {
    const payload = decodeJwtPayload(tokenWith({ name: 'Ñandú ✓', role: 'admin' }));
    expect(payload).toEqual({ name: 'Ñandú ✓', role: 'admin' });
  });

  it('devuelve null si el payload no es un objeto JSON', () => {
    const encode = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
    expect(decodeJwtPayload(`h.${encode('texto')}.s`)).toBeNull();
    expect(decodeJwtPayload(`h.${encode(null)}.s`)).toBeNull();
  });
});
