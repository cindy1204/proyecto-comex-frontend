import type { PDFFont } from 'pdf-lib';
import { toPdfText } from './pdf-text';

/**
 * Parte un texto en líneas que caben en `maxWidth` con la fuente y el tamaño dados. Respeta los
 * saltos de línea, rompe por palabras y, si una palabra no cabe sola, la corta por caracteres.
 */
export function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
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
