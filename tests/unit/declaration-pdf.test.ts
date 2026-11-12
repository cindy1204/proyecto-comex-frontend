import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import {
  createDeclarationPdf,
  declarationPdfContent,
  declarationRows,
  type DeclarationPdfContent,
} from '@/features/interactions/declaration-pdf';
import { FORM_FIELDS } from '@/features/interactions/domain/form-fields';
import type { TranslateFunction } from '@/features/i18n/domain/translate';

/** Traductor de prueba: devuelve la clave, así las filas se comparan por identificador. */
const t = ((key: string) => key) as TranslateFunction;

const DATA: Record<string, string> = {
  fechaTramite: '2026-10-01',
  tipoIdentificacion: 'NIT',
  identificacion: '900123456',
  nombreTitular: 'ACME S.A.S.',
  monedaNegociacion: 'USD',
  valorMonedaNegociacion: '1000.50',
  tasaCambioDolares: '1',
  valorTotalDolares: '1000.50',
  observaciones: '   ',
  nombreDeclarante: 'Ana Pérez',
  numeralCambiario: '1000',
};

function contentOf(overrides: Partial<DeclarationPdfContent> = {}): DeclarationPdfContent {
  return {
    title: 'Hoja de datos mínimos',
    family: 'Servicios',
    notice: 'Documento de apoyo, no oficial.',
    rows: declarationRows('formulario-servicios', DATA, t, 'Servicios de transporte'),
    fileName: 'hoja.pdf',
    ...overrides,
  };
}

describe('declarationRows', () => {
  it('sigue el orden de los campos del formulario y pone el numeral al final', () => {
    const rows = declarationRows('formulario-servicios', DATA, t, 'Servicios de transporte');
    const formLabels = FORM_FIELDS['formulario-servicios'].map((field) => field.labelKey);
    expect(rows.map((row) => row.label)).toEqual([...formLabels, 'interactions.numeral']);
  });

  it('muestra un guion cuando el valor está vacío o solo tiene espacios', () => {
    const rows = declarationRows('formulario-servicios', DATA, t, undefined);
    const observaciones = rows.find((row) => row.label.endsWith('.observaciones'));
    expect(observaciones?.value).toBe('-');
  });

  it('une código y título del numeral, o solo el código si no hay título', () => {
    const withTitle = declarationRows('formulario-servicios', DATA, t, 'Servicios de transporte');
    expect(withTitle.at(-1)?.value).toBe('1000 · Servicios de transporte');

    const withoutTitle = declarationRows('formulario-servicios', DATA, t, undefined);
    expect(withoutTitle.at(-1)?.value).toBe('1000');
  });
});

describe('declarationPdfContent', () => {
  it('construye título, familia, advertencia y nombre de archivo', () => {
    const content = declarationPdfContent('formulario-inversiones', DATA, 'Titulo', t);
    expect(content.title).toBe('interactions.declarationPdf.title');
    expect(content.family).toBe('interactions.types.formulario-inversiones');
    expect(content.notice).toBe('interactions.declarationPdf.notice');
    expect(content.fileName).toBe('hoja-datos-minimos-formulario-inversiones-2026-10-01.pdf');
  });

  it('usa "solicitud" en el nombre si no hay fecha', () => {
    const content = declarationPdfContent('formulario-endeudamiento', {}, undefined, t);
    expect(content.fileName).toBe('hoja-datos-minimos-formulario-endeudamiento-solicitud.pdf');
  });

  it('rechaza formularios que no son declaraciones de cambio', () => {
    expect(() => declarationPdfContent('formulario-importaciones', DATA, undefined, t)).toThrow(
      /no es una declaración de cambio/,
    );
  });
});

describe('createDeclarationPdf', () => {
  it('genera un PDF A4 de una página para una hoja corta', async () => {
    const bytes = await createDeclarationPdf(contentOf());
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    const { width, height } = pdf.getPage(0).getSize();
    expect(width).toBeCloseTo(595.28, 1);
    expect(height).toBeCloseTo(841.89, 1);
  });

  it('pasa a páginas nuevas cuando el contenido no cabe', async () => {
    const rows = Array.from({ length: 80 }, (_, index) => ({
      label: `Campo ${index + 1}`,
      value: 'Texto de prueba que ocupa más de una línea para forzar el salto de página. '.repeat(
        2,
      ),
    }));
    const pdf = await PDFDocument.load(await createDeclarationPdf(contentOf({ rows })));
    expect(pdf.getPageCount()).toBeGreaterThan(1);
  });

  it('no falla con caracteres que Helvetica no dibuja (emoji, CJK)', async () => {
    const rows = [{ label: 'Nombre', value: 'Empresa ✅ 北京 Ñandú — “prueba”' }];
    const bytes = await createDeclarationPdf(contentOf({ rows }));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
  });

  it('acepta una hoja sin filas', async () => {
    const pdf = await PDFDocument.load(await createDeclarationPdf(contentOf({ rows: [] })));
    expect(pdf.getPageCount()).toBe(1);
  });
});
