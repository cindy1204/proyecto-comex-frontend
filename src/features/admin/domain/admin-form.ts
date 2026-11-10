import { validateName, validateNewPassword } from '../../auth/domain/auth-form';
import type { RegisterPayload } from '../../auth/domain/auth';
import { validateEmail, type ValidationIssue } from '../../common/domain/validation';

export const ADMIN_PASSWORD_MIN_LENGTH = 12;

/** Alta de administrador: nombre, correo válido y contraseña de al menos 12 caracteres. */
export function validateCreateAdmin(values: RegisterPayload): ValidationIssue[] {
  return [
    ...validateName(values.name),
    ...validateEmail(values.email),
    ...validateNewPassword(values.password, ADMIN_PASSWORD_MIN_LENGTH),
  ];
}
