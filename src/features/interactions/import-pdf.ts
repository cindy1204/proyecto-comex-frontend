import { PDFDocument, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import { toPdfText } from './pdf-text';

type ImportFormData = Record<string, FormDataEntryValue>;

interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
  maxLines: number;
}

const boxes: Record<string, TextBox> = {
  fechaTramite: { x: 47.62, y: 683.57, width: 129.99, height: 16.36, maxLines: 1 },
  tipoIdentificacion: { x: 29.5, y: 621.23, width: 29.62, height: 20.34, maxLines: 1 },
  identificacion: { x: 59.12, y: 621.23, width: 141.49, height: 20.34, maxLines: 1 },
  nombreImportador: { x: 200.61, y: 621.23, width: 376.71, height: 20.34, maxLines: 1 },
  numeralOperacion: { x: 29.5, y: 560.08, width: 75.61, height: 19.9, maxLines: 1 },
  monedaNegociacion: { x: 105.1, y: 560.08, width: 113.63, height: 19.9, maxLines: 1 },
  valorMonedaNegociacion: { x: 218.74, y: 560.08, width: 117.61, height: 19.9, maxLines: 1 },
  tipoCambioDolar: { x: 336.35, y: 560.08, width: 105.23, height: 19.9, maxLines: 1 },
  valorTotalDolares: { x: 441.58, y: 560.08, width: 135.74, height: 19.9, maxLines: 1 },
  numeroDeclaracionFactura: { x: 29.5, y: 426.11, width: 368.31, height: 14.59, maxLines: 1 },
  valorFob: { x: 397.81, y: 426.11, width: 179.51, height: 14.59, maxLines: 1 },
  beneficiarioExterior: { x: 29.5, y: 247.29, width: 306.85, height: 10.61, maxLines: 1 },
  ciudadExterior: { x: 336.35, y: 247.29, width: 123.36, height: 10.61, maxLines: 1 },
  paisExterior: { x: 459.71, y: 247.29, width: 117.61, height: 10.61, maxLines: 1 },
  nombreDeclarante: { x: 29.5, y: 130.1, width: 246.72, height: 11.05, maxLines: 1 },
};

const observationsBox: TextBox = {
  x: 29.5,
  y: 186.22,
  width: 547.82,
  height: 31.39,
  maxLines: 4,
};

function getValue(data: ImportFormData, name: string) {
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

function drawLines(page: PDFPage, lines: string[], font: PDFFont, box: TextBox, fontSize: number) {
  const lineHeight = fontSize * 1.08;
  const firstBaseline =
    box.y + box.height / 2 + ((lines.length - 1) * lineHeight) / 2 - fontSize * 0.25;

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: box.x + 4,
      y: firstBaseline - index * lineHeight,
      font,
      size: fontSize,
    });
  });
}

function drawField(page: PDFPage, font: PDFFont, name: string, text: string) {
  if (!text) return;

  const box = boxes[name];
  const horizontalPadding = 8;

  for (let fontSize = 7; fontSize >= 4.5; fontSize -= 0.25) {
    const lines = wrapText(text, font, fontSize, box.width - horizontalPadding);
    if (lines.length <= box.maxLines && lines.length * fontSize * 1.08 <= box.height - 1) {
      drawLines(page, lines, font, box, fontSize);
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
  data: ImportFormData,
) {
  if (!lines.length) return;

  const pageWidth = 595.32;
  const pageHeight = 841.92;
  const margin = 52;
  const fontSize = 10;
  const lineHeight = 14;
  const contentWidth = pageWidth - margin * 2;
  const linesPerPage = Math.floor((pageHeight - margin * 2 - 70) / lineHeight);
  const title = 'Formulario 1 - Importaciones (continuación de observaciones)';
  const context = [
    `Importador: ${getValue(data, 'nombreImportador')}`,
    `Identificación: ${getValue(data, 'identificacion')}`,
  ];

  for (let offset = 0; offset < lines.length; offset += linesPerPage) {
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawText(title, { x: margin, y: pageHeight - margin, font, size: 12 });
    page.drawText(toPdfText(context.join('   |   ')), {
      x: margin,
      y: pageHeight - margin - 24,
      font,
      size: 9,
    });
    const pageLines = lines.slice(offset, offset + linesPerPage);

    pageLines.forEach((line, index) => {
      page.drawText(line, {
        x: margin,
        y: pageHeight - margin - 58 - index * lineHeight,
        font,
        size: fontSize,
        maxWidth: contentWidth,
      });
    });
  }
}

export async function downloadFilledImportPdf(data: Record<string, string>) {
  const response = await fetch('/formularios/formulario-importaciones.pdf');
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
    const observationFontSize = 7;
    const observationLines = wrapText(
      observations,
      font,
      observationFontSize,
      observationsBox.width - 8,
    );
    drawLines(
      page,
      observationLines.slice(0, observationsBox.maxLines),
      font,
      observationsBox,
      observationFontSize,
    );
    addObservationContinuation(pdf, font, observationLines.slice(observationsBox.maxLines), data);
  }

  const bytes = await pdf.save();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
  const link = document.createElement('a');
  const date = getValue(data, 'fechaTramite') || 'solicitud';

  link.href = url;
  link.download = `formulario-importaciones-${date}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
