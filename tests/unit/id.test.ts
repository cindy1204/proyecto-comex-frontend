import { describe, expect, it } from 'vitest';
import { isCuid } from '@/features/common/domain/id';

describe('isCuid', () => {
  it('acepta cuids válidos', () => {
    expect(isCuid('cmabc123def456ghi789jkl012')).toBe(true);
    expect(isCuid('c' + 'a'.repeat(20))).toBe(true);
    expect(isCuid('c' + 'a'.repeat(31))).toBe(true);
  });

  it('rechaza longitudes fuera de rango', () => {
    expect(isCuid('c' + 'a'.repeat(19))).toBe(false);
    expect(isCuid('c' + 'a'.repeat(32))).toBe(false);
  });

  it('rechaza valores que no empiezan por c o tienen mayúsculas y símbolos', () => {
    expect(isCuid('xmabc123def456ghi789jkl012')).toBe(false);
    expect(isCuid('Cmabc123def456ghi789jkl012')).toBe(false);
    expect(isCuid('cmabc123def456ghi789jkl01-')).toBe(false);
    expect(isCuid('')).toBe(false);
    expect(isCuid('1')).toBe(false);
    expect(isCuid(' cmabc123def456ghi789jkl012')).toBe(false);
  });
});
