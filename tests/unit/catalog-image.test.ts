import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CatalogImage } from '@/features/catalog/components/catalog-image';

vi.mock('@/features/common/config', () => ({
  getApiHost: () => 'https://api.example.com',
}));

describe('CatalogImage', () => {
  it.each(['1000', '2015', '9999'])('generates an accessible image for numeral %s', (code) => {
    const markup = renderToStaticMarkup(
      createElement(CatalogImage, { alt: `Imagen del numeral ${code}`, code, src: null }),
    );
    expect(markup).toContain('<svg');
    expect(markup).toContain(`aria-label="Imagen del numeral ${code}"`);
    expect(markup).toContain(`>${code}</text>`);
  });

  it('keeps a custom image and resolves relative backend URLs', () => {
    const markup = renderToStaticMarkup(
      createElement(CatalogImage, {
        alt: 'Imagen del numeral 2015',
        code: '2015',
        src: '/api/archivos/abc',
      }),
    );
    expect(markup).toContain('<img');
    expect(markup).toContain('src="https://api.example.com/api/archivos/abc"');
    expect(markup).not.toContain('<svg');
  });
});
