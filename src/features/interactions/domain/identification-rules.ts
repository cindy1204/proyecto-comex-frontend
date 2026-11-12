import type { TranslationKey } from '../../i18n/domain/translate';

/**
 * Reglas de formato por tipo de identificación. Son un filtro de captura, no una consulta a la
 * DIAN: solo comprueban forma y el dígito de verificación del NIT. Las longitudes de cédula y
 * pasaporte son aproximadas y deben confirmarse con la fuente oficial antes de endurecerlas.
 */

export const NIT_CHECK_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/** Dígito de verificación del NIT (DIAN): pesos desde el dígito de la derecha, módulo 11. */
export function nitCheckDigit(nit: string): number {
  let sum = 0;
  for (let index = 0; index < nit.length; index++) {
    const digit = Number(nit[nit.length - 1 - index]);
    sum += digit * NIT_CHECK_WEIGHTS[index];
  }
  const remainder = sum % 11;
  return remainder > 1 ? 11 - remainder : remainder;
}

/** El NIT exige el dígito de verificación: `800197268-4`. */
const NIT_PATTERN = /^(\d{6,10})-(\d)$/;
const NIT_WITHOUT_CHECK_DIGIT_PATTERN = /^\d{6,10}$/;
const CITIZEN_ID_PATTERN = /^\d{6,10}$/;
const FOREIGN_ID_PATTERN = /^[A-Za-z0-9]{6,20}$/;
const PASSPORT_PATTERN = /^[A-Za-z0-9]{5,20}$/;

/**
 * Clave de error para una identificación, o `null` si es válida. El NIT exige `-DV` y el dígito
 * debe coincidir con el calculado.
 */
export function identificationIssue(type: string, value: string): TranslationKey | null {
  if (type === 'NIT') {
    if (NIT_WITHOUT_CHECK_DIGIT_PATTERN.test(value)) return 'validation.nitCheckDigitMissing';
    const match = NIT_PATTERN.exec(value);
    if (!match) return 'validation.identificationInvalid';
    if (Number(match[2]) !== nitCheckDigit(match[1])) return 'validation.nitCheckDigit';
    return null;
  }
  if (type === 'Cédula de ciudadanía')
    return CITIZEN_ID_PATTERN.test(value) ? null : 'validation.identificationInvalid';
  if (type === 'Cédula de extranjería')
    return FOREIGN_ID_PATTERN.test(value) ? null : 'validation.identificationInvalid';
  if (type === 'Pasaporte')
    return PASSPORT_PATTERN.test(value) ? null : 'validation.identificationInvalid';
  return 'validation.identificationInvalid';
}
