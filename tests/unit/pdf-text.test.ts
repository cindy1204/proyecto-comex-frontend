import { describe, expect, it } from 'vitest';
import { toPdfText } from '@/features/interactions/pdf-text';

describe('toPdfText', () => {
  it('keeps characters that the standard PDF font can draw', () => {
    expect(toPdfText('Ñandú, año 2024 — “ok”')).toBe('Ñandú, año 2024 — “ok”');
  });

  it('replaces characters outside WinAnsi with a question mark', () => {
    expect(toPdfText('Ñandú → 2024 😀')).toBe('Ñandú ? 2024 ?');
    expect(toPdfText('≥ 10')).toBe('? 10');
  });

  it('composes decomposed accents', () => {
    expect(toPdfText('á')).toBe('á');
  });

  it('keeps line breaks, turns other whitespace into spaces and drops control characters', () => {
    expect(toPdfText('uno\ndos')).toBe('uno\ndos');
    expect(toPdfText('a\tb')).toBe('a b');
    expect(toPdfText('a\u0007b')).toBe('ab');
  });
});
