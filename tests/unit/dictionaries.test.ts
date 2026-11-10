import { describe, expect, it } from 'vitest';
import { en } from '@/features/i18n/dictionaries/en';
import { es } from '@/features/i18n/dictionaries/es';

/** Hojas del diccionario como `ruta.con.puntos` -> texto. */
function flatten(node: unknown, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.set(path, value);
    else for (const [p, v] of flatten(value, path)) out.set(p, v);
  }
  return out;
}

const params = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const esLeaves = flatten(es);
const enLeaves = flatten(en);

describe('diccionarios es / en', () => {
  it('tienen exactamente las mismas claves', () => {
    expect([...enLeaves.keys()].sort()).toEqual([...esLeaves.keys()].sort());
  });

  it('cada clave usa los mismos parámetros {nombre} en ambos idiomas', () => {
    const mismatches = [...esLeaves]
      .filter(([key, text]) => params(text).join() !== params(enLeaves.get(key) ?? '').join())
      .map(([key]) => key);
    expect(mismatches).toEqual([]);
  });

  it('no hay textos vacíos', () => {
    const empty = [...esLeaves, ...enLeaves].filter(([, text]) => text.trim() === '');
    expect(empty).toEqual([]);
  });

  it('toda variante plural _one tiene su _other (y viceversa de las usadas)', () => {
    for (const leaves of [esLeaves, enLeaves]) {
      for (const key of leaves.keys()) {
        if (key.endsWith('_one'))
          expect(leaves.has(key.replace(/_one$/, '_other')), key).toBe(true);
      }
    }
  });
});
