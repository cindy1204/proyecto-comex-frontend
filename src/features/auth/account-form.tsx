'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from './auth-provider';

export function AccountForm({ mode }: Readonly<{ mode: 'login' | 'register' }>) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      if (mode === 'register') await register(name, email, password);
      else await login(email, password);
      router.replace('/mis-interacciones');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo completar el acceso.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="form-card account-card">
      <p className="eyebrow">{mode === 'register' ? 'Únete a ColComex' : 'Bienvenido de nuevo'}</p>
      <h1>{mode === 'register' ? 'Crear una cuenta' : 'Iniciar sesión'}</h1>
      <p className="muted">
        {mode === 'register'
          ? 'Crea tu cuenta para guardar y consultar tus solicitudes.'
          : 'Ingresa para guardar o consultar tus solicitudes.'}
      </p>
      <form className="form-stack" onSubmit={submit}>
        {mode === 'register' && (
          <label className="field">
            <span>Nombre completo</span>
            <input autoComplete="name" maxLength={120} minLength={2} name="name" required />
          </label>
        )}
        <label className="field">
          <span>Correo electrónico</span>
          <input autoComplete="email" maxLength={254} name="email" required type="email" />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            maxLength={128}
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        {message && <p className="form-message form-message-error" role="alert">{message}</p>}
        <button className="button button-wide" disabled={submitting} type="submit">
          {submitting ? 'Procesando…' : mode === 'register' ? 'Crear cuenta' : 'Ingresar'}
        </button>
      </form>
      <p className="form-switch">
        {mode === 'register' ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}{' '}
        <Link href={mode === 'register' ? '/login' : '/registro'}>
          {mode === 'register' ? 'Inicia sesión' : 'Regístrate'}
        </Link>
      </p>
    </section>
  );
}
