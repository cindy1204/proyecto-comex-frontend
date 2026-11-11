import { PDFDocument, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import { toPdfText } from './pdf-text';

type ExportFormData = Record<string, FormDataEntryValue>;

interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
  maxLines: number;
}

const pageWidth = 841.92;
const pageHeight = 595.32;
const printArea = { left: 6, top: 13.5, width: 620.5, height: 712 };
const margin = 18;
const scale = Math.min(
  (pageWidth - margin * 2) / printArea.width,
  (pageHeight - margin * 2) / printArea.height,
);
const horizontalOffset =
  margin + (pageWidth - margin * 2 - printArea.width * scale) / 2 - printArea.left * scale;

function box(left: number, top: number, width: number, height: number): TextBox {
  return {
    x: horizontalOffset + left * scale,
    y: pageHeight - margin - (top + height - printArea.top) * scale,
    width: width * scale,
    height: height * scale,
    maxLines: 1,
  };
}

const boxes: Record<string, TextBox> = {
  fechaTramite: box(6, 145, 218.5, 19.5),
  tipoIdentificacion: box(6, 213.5, 41, 19.5),
  identificacion: box(47, 213.5, 151.5, 19.5),
  nombreExportador: box(198.5, 213.5, 428, 19.5),
  monedaNegociacion: box(6, 281, 141.5, 20),
  valorMonedaNegociacion: box(147.5, 281, 170.5, 20),
  tasaCambioDolares: box(318, 281, 153.5, 20),
  valorTotalDolares: box(471.5, 281, 155, 20),
  numeroDocumento: box(6, 407.5, 321, 16.5),
  numeralCambiario: box(327, 407.5, 120.5, 16.5),
  valorReintegrado: box(447.5, 407.5, 179, 16.5),
  totalValorFob: box(447.5, 523, 179, 19.5),
  totalGastosExportacion: box(447.5, 542.5, 179, 15.5),
  deducciones: box(447.5, 558, 179, 16.5),
  reintegroNetoCalculado: box(447.5, 574.5, 179, 18),
  nombreDeclarante: box(6, 702.5, 294, 23),
};

const observationsBox = box(6, 640, 620.5, 15.5);

function getValue(data: ExportFormData, name: string) {
  const value = data[name];
  return typeof value === 'string' ? value.trim() : '';
}

function getIdentificationCode(value: string) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (normalized === 'cedula de ciudadania') return 'C.C.';
  if (normalized === 'cedula de extranjeria') return 'C.E.';
  if (normalized === 'pasaporte') return 'PAS.';
  return value;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const lines: string[] = [];
  const paragraphs = toPdfText(text).split(/\r?\n/);

  for (const paragraph of paragraphs) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        line = candidate;
        continue;
      }

      if (line) {
        lines.push(line);
        line = '';
      }

      let segment = '';
      for (const character of word) {
        const nextSegment = segment + character;
        if (segment && font.widthOfTextAtSize(nextSegment, fontSize) > maxWidth) {
          lines.push(segment);
          segment = character;
        } else {
          segment = nextSegment;
        }
      }
      line = segment;
    }

    if (line || !paragraph) lines.push(line);
  }

  return lines;
}

function drawLines(
  page: PDFPage,
  lines: string[],
  font: PDFFont,
  target: TextBox,
  fontSize: number,
) {
  const lineHeight = fontSize * 1.08;
  const firstBaseline =
    target.y + target.height / 2 + ((lines.length - 1) * lineHeight) / 2 - fontSize * 0.25;

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: target.x + 3,
      y: firstBaseline - index * lineHeight,
      font,
      size: fontSize,
    });
  });
}

function drawField(page: PDFPage, font: PDFFont, name: string, text: string) {
  if (!text) return;

  const target = boxes[name];
  for (let fontSize = 7; fontSize >= 4.5; fontSize -= 0.25) {
    const lines = wrapText(text, font, fontSize, target.width - 6);
    if (lines.length <= target.maxLines && lines.length * fontSize * 1.08 <= target.height - 1) {
      drawLines(page, lines, font, target, fontSize);
      return;
    }
  }

  throw new Error(
    `El contenido de "${name}" es demasiado largo para la casilla del formulario oficial.`,
  );
}

function addObservationContinuation(
  pdf: PDFDocument,
  font: PDFFont,
  lines: string[],
  data: ExportFormData,
) {
  if (!lines.length) return;

  const pageWidth = 595.32;
  const pageHeight = 841.92;
  const pageMargin = 52;
  const fontSize = 10;
  const lineHeight = 14;
  const contentWidth = pageWidth - pageMargin * 2;
  const linesPerPage = Math.floor((pageHeight - pageMargin * 2 - 70) / lineHeight);
  const title = 'Formulario 2 - Exportaciones (continuación de observaciones)';
  const context = [
    `Exportador: ${getValue(data, 'nombreExportador')}`,
    `Identificación: ${getValue(data, 'identificacion')}`,
  ];

  for (let offset = 0; offset < lines.length; offset += linesPerPage) {
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawText(title, { x: pageMargin, y: pageHeight - pageMargin, font, size: 12 });
    page.drawText(toPdfText(context.join('   |   ')), {
      x: pageMargin,
      y: pageHeight - pageMargin - 24,
      font,
      size: 9,
    });
    const pageLines = lines.slice(offset, offset + linesPerPage);

    pageLines.forEach((line, index) => {
      page.drawText(line, {
        x: pageMargin,
        y: pageHeight - pageMargin - 58 - index * lineHeight,
        font,
        size: fontSize,
        maxWidth: contentWidth,
      });
    });
  }
}

export async function downloadFilledExportPdf(data: Record<string, string>) {
  const response = await fetch('/formularios/formulario-exportaciones.pdf');
  if (!response.ok) {
    throw new Error(`No se pudo cargar la plantilla oficial (HTTP ${response.status}).`);
  }

  const pdf = await PDFDocument.load(await response.arrayBuffer());
  const page = pdf.getPages()[0];
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (const name of Object.keys(boxes)) {
    const value =
      name === 'tipoIdentificacion'
        ? getIdentificationCode(getValue(data, name))
        : getValue(data, name);
    drawField(page, font, name, value);
  }

  const observations = getValue(data, 'observaciones');
  if (observations) {
    const observationFontSize = 6.5;
    const observationLines = wrapText(
      observations,
      font,
      observationFontSize,
      observationsBox.width - 6,
    );
    drawLines(page, observationLines.slice(0, 1), font, observationsBox, observationFontSize);
    addObservationContinuation(pdf, font, observationLines.slice(1), data);
  }

  const bytes = await pdf.save();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
  const link = document.createElement('a');
  const date = getValue(data, 'fechaTramite') || 'solicitud';

  link.href = url;
  link.download = `formulario-exportaciones-${date}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
