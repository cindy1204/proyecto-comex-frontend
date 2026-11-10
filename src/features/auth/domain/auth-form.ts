import { validateEmail, type ValidationIssue } from '../../common/domain/validation';
import type { LoginCredentials, RegisterPayload } from './auth';

export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MIN_LENGTH = 2;

export interface RegisterValues extends RegisterPayload {
  confirmPassword: string;
}

/** Login: correo y contraseña no vacíos, y correo con formato válido. */
export function validateLogin(values: LoginCredentials): ValidationIssue[] {
  const issues = validateEmail(values.email);
  if (!values.password) issues.push({ field: 'password', key: 'validation.passwordRequired' });
  return issues;
}

/** Nombre obligatorio con un mínimo de caracteres (registro y alta de administradores). */
export function validateName(name: string): ValidationIssue[] {
  if (!name) return [{ field: 'name', key: 'validation.nameRequired' }];
  if (name.length < NAME_MIN_LENGTH) {
    return [{ field: 'name', key: 'validation.nameMinLength', params: { min: NAME_MIN_LENGTH } }];
  }
  return [];
}

/** Contraseña obligatoria con longitud mínima (la longitud cuenta caracteres, sin recortar). */
export function validateNewPassword(password: string, minLength: number): ValidationIssue[] {
  if (!password) return [{ field: 'password', key: 'validation.passwordRequired' }];
  if (password.length < minLength) {
    return [{ field: 'password', key: 'validation.passwordMinLength', params: { min: minLength } }];
  }
  return [];
}

/** Registro: nombre, correo válido, contraseña de al menos 8 caracteres y confirmación igual. */
export function validateRegister(values: RegisterValues): ValidationIssue[] {
  const issues = [
    ...validateName(values.name),
    ...validateEmail(values.email),
    ...validateNewPassword(values.password, PASSWORD_MIN_LENGTH),
  ];
  if (!values.confirmPassword) {
    issues.push({ field: 'confirmPassword', key: 'validation.confirmPasswordRequired' });
  } else if (values.confirmPassword !== values.password) {
    issues.push({ field: 'confirmPassword', key: 'auth.register.passwordMismatch' });
  }
  return issues;
}
