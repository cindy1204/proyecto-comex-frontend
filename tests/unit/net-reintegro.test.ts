import { describe, expect, it } from 'vitest';
import {
  calculateNetReintegro,
  validateInteractionForm,
} from '@/features/interactions/domain/form-fields';

function formOf(entries: Record<string, string>): FormData {
  const form = new FormData();
  for (const [name, value] of Object.entries(entries)) form.append(name, value);
  return form;
}

describe('calculateNetReintegro', () => {
  it('adds FOB and expenses, then subtracts deductions, with exact cents', () => {
    const form = formOf({
      totalValorFob: '1000,10',
      totalGastosExportacion: '0.20',
      deducciones: '0.30',
    });
    expect(calculateNetReintegro(form)).toBe('1000.00');
  });

  it('treats empty or invalid values as zero', () => {
    expect(calculateNetReintegro(formOf({ totalValorFob: '', deducciones: 'x' }))).toBe('0.00');
  });

  it('reports a negative result when deductions exceed the base', () => {
    const form = formOf({
      totalValorFob: '100',
      totalGastosExportacion: '0',
      deducciones: '150',
    });
    expect(calculateNetReintegro(form)).toBe('-50.00');
  });
});

describe('validateInteractionForm (export net)', () => {
  it('flags deductions when the net reimbursement is negative', () => {
    const issues = validateInteractionForm(
      'formulario-exportaciones',
      formOf({ totalValorFob: '100', totalGastosExportacion: '0', deducciones: '150' }),
    );
    expect(issues).toContainEqual({ field: 'deducciones', key: 'validation.netNegative' });
  });

  it('does not flag deductions when the net reimbursement is not negative', () => {
    const issues = validateInteractionForm(
      'formulario-exportaciones',
      formOf({ totalValorFob: '100', totalGastosExportacion: '0', deducciones: '100' }),
    );
    expect(issues.some((issue) => issue.key === 'validation.netNegative')).toBe(false);
  });
});
