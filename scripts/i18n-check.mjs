#!/usr/bin/env node
/**
 * Verificación ligera de i18n, sin dependencias (`npm run i18n:check`).
 *
 * 1. Paridad: `es.ts` y `en.ts` (y cualquier otro idioma de `dictionaries/`) deben tener las mismas
 *    claves, los mismos parámetros `{nombre}` y ambas variantes plurales (`_one` / `_other`).
 * 2. Texto fijo en español: busca en `src/features/**\/components` y `src/app` texto JSX y atributos
 *    de texto (`label`, `title`, `aria-label`, …) que parezcan español en lugar de `t('clave')`.
 *
 * Límites (heurística, no análisis semántico):
 * - Detecta español por tildes, `¿`/`¡` y una lista corta de palabras vacías; el texto español sin
 *   ninguna de ellas pasa inadvertido, y un texto en inglés con tilde (nombre propio) es falso positivo.
 * - Solo mira texto JSX y atributos literales; no sigue variables ni cadenas construidas en código.
 * - No detecta otros idiomas ni verifica que la traducción sea correcta; solo que la clave exista.
 * - Se omite una línea con el comentario `i18n-ignore` en la misma línea o en la anterior.
 * - Las claves usadas en `t('…')` las valida el compilador (`npm run typecheck`), no este script.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DICTIONARIES_DIR = join(ROOT, 'src/features/i18n/dictionaries');
const BASE_LOCALE = 'es';

const problems = [];
const report = (message) => problems.push(message);

function walk(dir, accept) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...walk(path, accept));
    else if (accept(path)) found.push(path);
  }
  return found;
}

// ---------------------------------------------------------------- 1. Paridad de diccionarios

function loadDictionary(file) {
  const source = readFileSync(file, 'utf8');
  const start = source.search(/export const \w+(:\s*\w+)?\s*=\s*\{/);
  if (start === -1) throw new Error(`No se encontró el objeto del diccionario en ${file}`);
  const open = source.indexOf('{', source.indexOf('=', start));
  const close = source.lastIndexOf('\n};');
  if (close === -1) throw new Error(`No se encontró el cierre del diccionario en ${file}`);
  // El diccionario es un literal plano (sin imports ni expresiones), así que se evalúa tal cual.
  return new Function(`return (${source.slice(open, close + 2)});`)();
}

function flatten(node, prefix = '') {
  const leaves = new Map();
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') leaves.set(path, value);
    else for (const [p, v] of flatten(value, path)) leaves.set(p, v);
  }
  return leaves;
}

const params = (text) =>
  [...text.matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join(',');

function checkParity() {
  const files = readdirSync(DICTIONARIES_DIR).filter((name) =>
    /^[a-z]{2}(-[A-Za-z]+)?\.ts$/.test(name),
  );
  const dictionaries = new Map(
    files.map((name) => [
      name.replace(/\.ts$/, ''),
      flatten(loadDictionary(join(DICTIONARIES_DIR, name))),
    ]),
  );
  const base = dictionaries.get(BASE_LOCALE);
  if (!base) throw new Error(`Falta el diccionario base ${BASE_LOCALE}.ts`);

  for (const [locale, leaves] of dictionaries) {
    for (const key of base.keys())
      if (!leaves.has(key)) report(`[${locale}] falta la clave "${key}"`);
    if (locale === BASE_LOCALE) continue;
    for (const key of leaves.keys())
      if (!base.has(key)) report(`[${locale}] clave sobrante "${key}"`);
    for (const [key, text] of leaves) {
      const reference = base.get(key);
      if (reference !== undefined && params(reference) !== params(text)) {
        report(
          `[${locale}] parámetros distintos en "${key}": {${params(text)}} vs {${params(reference)}}`,
        );
      }
      if (text.trim() === '') report(`[${locale}] valor vacío en "${key}"`);
    }
  }
  for (const [locale, leaves] of dictionaries) {
    for (const key of leaves.keys()) {
      if (key.endsWith('_one') && !leaves.has(key.replace(/_one$/, '_other'))) {
        report(`[${locale}] "${key}" no tiene su variante _other`);
      }
    }
  }
  return dictionaries.size;
}

// ---------------------------------------------------------------- 2. Español fijo en la UI

const SPANISH_STOPWORDS = new Set([
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'de',
  'del',
  'al',
  'para',
  'por',
  'con',
  'sin',
  'tu',
  'tus',
  'su',
  'sus',
  'que',
  'y',
  'o',
  'en',
  'se',
  'es',
  'no',
  'si',
  'mi',
  'mis',
  'como',
  'este',
  'esta',
  'estos',
  'estas',
  'hay',
  'aún',
  'más',
  'cargando',
  'guardando',
  'enviando',
  'iniciar',
  'sesión',
  'crear',
  'cuenta',
  'guardar',
  'cancelar',
  'eliminar',
  'editar',
  'ver',
  'volver',
  'inicio',
  'buscar',
  'todos',
  'todas',
  'siguiente',
  'anterior',
  'cerrar',
  'solicitud',
  'solicitudes',
  'correo',
  'contraseña',
  'nombre',
  'empresa',
  'teléfono',
]);

const hasAccent = (text) => /[áéíóúñÁÉÍÓÚÑ¿¡]/.test(text);

function looksSpanish(text) {
  if (hasAccent(text)) return true;
  const words = text.toLowerCase().match(/[a-záéíóúñ]+/g) ?? [];
  if (words.length < 2) return false;
  const hits = words.filter((word) => SPANISH_STOPWORDS.has(word)).length;
  return hits >= 2;
}

const TEXT_ATTRIBUTES = [
  'label',
  'title',
  'description',
  'hint',
  'placeholder',
  'aria-label',
  'alt',
  'caption',
  'emptyTitle',
  'emptyDescription',
  'loadingLabel',
  'confirmLabel',
  'eyebrow',
  'itemsLabel',
  'aria-description',
  'aria-placeholder',
];
const ATTRIBUTE_PATTERN = new RegExp(`\\b(?:${TEXT_ATTRIBUTES.join('|')})="([^"{}]+)"`, 'g');

function stripComments(line, state) {
  let text = line;
  if (state.inBlock) {
    const end = text.indexOf('*/');
    if (end === -1) return '';
    state.inBlock = false;
    text = text.slice(end + 2);
  }
  text = text.replace(/\/\*.*?\*\//g, '');
  const open = text.indexOf('/*');
  if (open !== -1) {
    state.inBlock = true;
    text = text.slice(0, open);
  }
  return text.replace(/(^|\s)\/\/.*$/, '$1');
}

function scanFile(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const state = { inBlock: false };
  const name = relative(ROOT, file);
  let previous = '';
  lines.forEach((raw, index) => {
    const ignored = raw.includes('i18n-ignore') || previous.includes('i18n-ignore');
    previous = raw;
    const line = stripComments(raw, state);
    if (ignored || line.trim() === '') return;
    const where = `${name}:${index + 1}`;

    for (const match of line.matchAll(ATTRIBUTE_PATTERN)) {
      if (looksSpanish(match[1])) report(`${where} atributo con texto fijo: "${match[1]}"`);
    }
    // Texto JSX: entre `>` y `<` en la misma línea, o una línea que es solo texto.
    const candidates = [...line.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]);
    if (!/[<>{}=;()]|=>|^\s*(import|export|const|return)\b/.test(line)) candidates.push(line);
    for (const text of candidates) {
      const trimmed = text.trim();
      if (trimmed && looksSpanish(trimmed)) report(`${where} texto JSX fijo: "${trimmed}"`);
    }
    // Cadenas con tilde fuera de atributos (p. ej. `'Cargando…'` en una expresión).
    for (const match of line.matchAll(/(['"`])((?:(?!\1).)*[áéíóúñÁÉÍÓÚÑ¿¡](?:(?!\1).)*)\1/g)) {
      if (!ATTRIBUTE_PATTERN.test(match[0])) report(`${where} cadena con español: ${match[0]}`);
      ATTRIBUTE_PATTERN.lastIndex = 0;
    }
  });
}

function checkHardcoded() {
  const isSource = (path) => /\.tsx?$/.test(path) && !/\.(test|spec)\./.test(path);
  const files = [
    ...walk(join(ROOT, 'src/app'), isSource),
    ...walk(join(ROOT, 'src/features'), (path) => isSource(path) && path.includes('/components/')),
  ];
  for (const file of files) scanFile(file);
  return files.length;
}

// ---------------------------------------------------------------- Ejecución

const locales = checkParity();
const scanned = checkHardcoded();
const unique = [...new Set(problems)];

if (unique.length > 0) {
  process.stderr.write(`i18n:check encontró ${unique.length} problema(s):\n`);
  for (const message of unique) process.stderr.write(`  - ${message}\n`);
  process.exit(1);
}
process.stdout.write(
  `i18n:check OK: ${locales} idiomas con las mismas claves; ${scanned} archivos sin texto fijo en español.\n`,
);
