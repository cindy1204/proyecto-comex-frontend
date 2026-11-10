import { describe, expect, it } from 'vitest';
import { validateCreateAdmin } from '@/features/admin/domain/admin-form';
import { validateLogin, validateRegister } from '@/features/auth/domain/auth-form';
import { isValidEmail, validateEmail } from '@/features/common/domain/validation';

const keys = (issues: { field: string; key: string }[]) =>
  issues.map(({ field, key }) => `${field}:${key}`);

describe('isValidEmail / validateEmail', () => {
  it.each(['a@b.co', 'nombre.apellido@empresa.com.co'])('acepta %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
    expect(validateEmail(email)).toEqual([]);
  });

  it.each(['sin-arroba', 'a@b', 'a b@c.co', '@c.co', `${'a'.repeat(250)}@b.co`])(
    'rechaza %j',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );

  it('distingue vacío de formato inválido', () => {
    expect(keys(validateEmail(''))).toEqual(['email:validation.emailRequired']);
    expect(keys(validateEmail('x'))).toEqual(['email:validation.emailInvalid']);
  });
});

describe('validateLogin', () => {
  it('acepta credenciales completas', () => {
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual([]);
  });

  it('reporta correo y contraseña vacíos por campo', () => {
    expect(keys(validateLogin({ email: '', password: '' }))).toEqual([
      'email:validation.emailRequired',
      'password:validation.passwordRequired',
    ]);
  });
});

describe('validateRegister', () => {
  const valid = {
    name: 'Ana',
    email: 'ana@empresa.co',
    password: 'Segura#2026',
    confirmPassword: 'Segura#2026',
  };

  it('acepta un registro válido', () => {
    expect(validateRegister(valid)).toEqual([]);
  });

  it('exige mínimo de nombre y de contraseña, con el mínimo como parámetro', () => {
    const issues = validateRegister({
      ...valid,
      name: 'A',
      password: 'corta',
      confirmPassword: 'corta',
    });
    expect(keys(issues)).toEqual([
      'name:validation.nameMinLength',
      'password:validation.passwordMinLength',
    ]);
    expect(issues[1]?.params).toEqual({ min: 8 });
  });

  it('detecta confirmación ausente o distinta', () => {
    expect(keys(validateRegister({ ...valid, confirmPassword: '' }))).toEqual([
      'confirmPassword:validation.confirmPasswordRequired',
    ]);
    expect(keys(validateRegister({ ...valid, confirmPassword: 'otra' }))).toEqual([
      'confirmPassword:auth.register.passwordMismatch',
    ]);
  });
});

describe('validateCreateAdmin', () => {
  it('exige 12 caracteres de contraseña', () => {
    const issues = validateCreateAdmin({ name: 'Root', email: 'r@x.co', password: 'Corta#2026' });
    expect(keys(issues)).toEqual(['password:validation.passwordMinLength']);
    expect(issues[0]?.params).toEqual({ min: 12 });
  });

  it('acepta una alta válida', () => {
    expect(
      validateCreateAdmin({ name: 'Root', email: 'r@x.co', password: 'Larga#Segura2026' }),
    ).toEqual([]);
  });
});
