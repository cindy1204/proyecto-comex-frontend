/**
 * Las fuentes estándar de pdf-lib (Helvetica) solo dibujan WinAnsi/cp1252. Cualquier otro
 * carácter (emoji, flechas, ≥, CJK…) lanza un error al dibujar, así que se sanea antes.
 */
const WIN_ANSI_EXTRAS = new Set(['€', '‘', '’', '“', '”', '–', '—', '•', '…']);
const REPLACEMENT = '?';

function isWinAnsi(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return (
    (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRAS.has(char)
  );
}

/**
 * Prepara texto libre para dibujarlo con una fuente estándar de PDF: compone acentos (NFC),
 * conserva saltos de línea, convierte cualquier otro espacio en espacio, descarta caracteres
 * de control y sustituye lo que la fuente no puede dibujar por "?".
 */
export function toPdfText(text: string): string {
  let out = '';
  for (const char of text.normalize('NFC')) {
    if (char === '\n' || char === '\r') out += char;
    else if (/\s/.test(char)) out += ' ';
    else if (isWinAnsi(char)) out += char;
    else if (!/\p{Cc}/u.test(char)) out += REPLACEMENT;
  }
  return out;
}
