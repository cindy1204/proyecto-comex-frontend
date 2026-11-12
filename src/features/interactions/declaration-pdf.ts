import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { TranslateFunction } from '../i18n/domain/translate';
import { FORM_FIELDS } from './domain/form-fields';
import {
  isDeclarationType,
  type DeclarationType,
  type InteractionType,
} from './domain/interaction';
import { wrapText } from './pdf-wrap';

/**
 * Hoja de datos mínimos de servicios, inversiones y endeudamiento. NO es el formulario oficial del
 * Banco de la República: el anexo DCIP-83 no publica una plantilla por familia. Por eso se genera
 * desde cero, con una advertencia visible, y nunca se presenta como formato oficial.
 */

export interface DeclarationPdfRow {
  label: string;
  value: string;
}

export interface DeclarationPdfContent {
  /** Título de la hoja, p. ej. "Hoja de datos mínimos". */
  title: string;
  /** Familia de la operación, p. ej. "Servicios". */
  family: string;
  /** Advertencia de que el documento no es oficial. */
  notice: string;
  rows: DeclarationPdfRow[];
  fileName: string;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const TITLE_SIZE = 18;
const FAMILY_SIZE = 13;
const NOTICE_SIZE = 9;
const LABEL_SIZE = 9;
const VALUE_SIZE = 11;
const LINE_FACTOR = 1.35;
const ROW_GAP = 10;
const MUTED = rgb(0.38, 0.38, 0.38);
const RULE = rgb(0.75, 0.75, 0.75);

/** Filas en el orden del formulario y numeral al final; un valor vacío se muestra como guion. */
export function declarationRows(
  type: DeclarationType,
  data: Record<string, string>,
  t: TranslateFunction,
  numeralTitle: string | undefined,
): DeclarationPdfRow[] {
  const rows: DeclarationPdfRow[] = FORM_FIELDS[type].map((field) => ({
    label: t(field.labelKey),
    value: data[field.name]?.trim() || '-',
  }));
  const code = data.numeralCambiario?.trim() || '-';
  rows.push({
    label: t('interactions.numeral'),
    value: numeralTitle ? `${code} · ${numeralTitle}` : code,
  });
  return rows;
}

/** Contenido completo de la hoja para un formulario de declaración guardado. */
export function declarationPdfContent(
  type: InteractionType,
  data: Record<string, string>,
  numeralTitle: string | undefined,
  t: TranslateFunction,
): DeclarationPdfContent {
  if (!isDeclarationType(type)) throw new Error(`"${type}" no es una declaración de cambio.`);
  const date = data.fechaTramite?.trim() || 'solicitud';
  return {
    title: t('interactions.declarationPdf.title'),
    family: t(`interactions.types.${type}`),
    notice: t('interactions.declarationPdf.notice'),
    rows: declarationRows(type, data, t, numeralTitle),
    fileName: `hoja-datos-minimos-${type}-${date}.pdf`,
  };
}

export async function createDeclarationPdf(content: DeclarationPdfContent): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursor = PAGE_HEIGHT - MARGIN;

  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursor = PAGE_HEIGHT - MARGIN;
  };

  /** Escribe texto envuelto; cada línea ocupa `size * LINE_FACTOR` y salta de página si hace falta. */
  const writeText = (text: string, font: PDFFont, size: number, color = rgb(0, 0, 0)) => {
    const lineHeight = size * LINE_FACTOR;
    for (const line of wrapText(text, font, size, CONTENT_WIDTH)) {
      if (cursor - lineHeight < MARGIN) newPage();
      page.drawText(line, { x: MARGIN, y: cursor - size, font, size, color });
      cursor -= lineHeight;
    }
  };

  const rule = () => {
    if (cursor - ROW_GAP < MARGIN) newPage();
    cursor -= ROW_GAP / 2;
    page.drawLine({
      start: { x: MARGIN, y: cursor },
      end: { x: PAGE_WIDTH - MARGIN, y: cursor },
      thickness: 0.5,
      color: RULE,
    });
    cursor -= ROW_GAP;
  };

  writeText(content.title, bold, TITLE_SIZE);
  cursor -= 4;
  writeText(content.family, bold, FAMILY_SIZE);
  cursor -= 6;
  writeText(content.notice, regular, NOTICE_SIZE, MUTED);
  rule();

  for (const row of content.rows) {
    writeText(row.label, regular, LABEL_SIZE, MUTED);
    writeText(row.value, regular, VALUE_SIZE);
    cursor -= ROW_GAP;
  }

  const pages = pdf.getPages();
  pages.forEach((current, index) => {
    current.drawText(`${index + 1} / ${pages.length}`, {
      x: PAGE_WIDTH / 2 - 12,
      y: MARGIN / 2,
      font: regular,
      size: 8,
      color: MUTED,
    });
  });

  return pdf.save();
}

/** Genera la hoja y la descarga como archivo; los errores de generación los gestiona quien llama. */
export async function downloadDeclarationPdf(content: DeclarationPdfContent): Promise<void> {
  const bytes = await createDeclarationPdf(content);
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = content.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
