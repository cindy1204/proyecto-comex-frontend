import { describe, expect, it } from 'vitest';
import { resolveMediaUrl } from '@/features/common/domain/media-url';

const HOST = 'https://api.example.com';

describe('resolveMediaUrl', () => {
  it('antepone el origen del backend a una ruta relativa de la API', () => {
    expect(resolveMediaUrl('/api/archivos/cmabc123def456ghi789jkl012', HOST)).toBe(
      'https://api.example.com/api/archivos/cmabc123def456ghi789jkl012',
    );
  });

  it('deja intactas las URLs absolutas (Supabase)', () => {
    const url = 'https://proyecto.supabase.co/storage/v1/object/public/catalogo/a.png';
    expect(resolveMediaUrl(url, HOST)).toBe(url);
  });

  it('no trata una URL protocol-relative como ruta del backend', () => {
    expect(resolveMediaUrl('//cdn.example.com/a.png', HOST)).toBe('//cdn.example.com/a.png');
  });

  it('devuelve null cuando no hay imagen', () => {
    expect(resolveMediaUrl(null, HOST)).toBeNull();
    expect(resolveMediaUrl('', HOST)).toBeNull();
  });
});
