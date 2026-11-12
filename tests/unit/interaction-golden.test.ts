import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateInteractionForm } from '@/features/interactions/domain/form-fields';
import type { InteractionType } from '@/features/interactions/domain/interaction';

/**
 * Casos compartidos con el backend: `tests/golden/interaction-validation.json` debe ser idéntico
 * al del backend. La fecha de referencia es fija (`today`), igual que en el backend.
 */
type Family = 'importaciones' | 'exportaciones' | 'declaracion';

interface GoldenCase {
  name: string;
  family: Family;
  overrides: Record<string, string>;
  expectedFields: string[];
}

interface Golden {
  bases: Record<Family, Record<string, string>>;
  cases: GoldenCase[];
}

/** La familia `declaracion` del contrato compartido corresponde al formulario de servicios. */
const TYPE_BY_FAMILY: Record<Family, InteractionType> = {
  importaciones: 'formulario-importaciones',
  exportaciones: 'formulario-exportaciones',
  declaracion: 'formulario-servicios',
};

const TODAY = '2026-11-12';

const golden: Golden = JSON.parse(
  readFileSync(new URL('../golden/interaction-validation.json', import.meta.url), 'utf8'),
);

function formOf(entries: Record<string, string>): FormData {
  const form = new FormData();
  for (const [name, value] of Object.entries(entries)) form.append(name, value);
  return form;
}

/** Campos con error, únicos y ordenados (`[]` si el formulario es válido). */
function failingFields(type: InteractionType, entries: Record<string, string>): string[] {
  const issues = validateInteractionForm(type, formOf(entries), TODAY);
  return [...new Set(issues.map((issue) => issue.field))].sort();
}

describe('casos dorados de validación (compartidos con el backend)', () => {
  it.each(golden.cases)('$name', ({ family, overrides, expectedFields }) => {
    const entries = { ...golden.bases[family], ...overrides };
    expect(failingFields(TYPE_BY_FAMILY[family], entries)).toEqual([...expectedFields].sort());
  });
});
