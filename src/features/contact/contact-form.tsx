'use client';

import { useState, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';

const productTypes = [
  ['importaciones', 'Importaciones de bienes'],
  ['exportaciones', 'Exportaciones de bienes'],
  ['deudaExterna', 'Endeudamiento externo, avales y garantías'],
  ['inversiones', 'Inversiones internacionales'],
  ['servicios', 'Servicios, transferencias y otros conceptos'],
] as const;

export function ContactForm() {
  const { token, loading: authLoading } = useAuth();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSent(false);
    setSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await apiRequest('/api/contacto', {
        method: 'POST',
        token: token ?? undefined,
        body: Object.fromEntries(formData.entries()),
      });
      form.reset();
      setSent(true);
      setMessage(token
        ? 'Recibimos tu solicitud. Puedes consultarla en Mis solicitudes.'
        : 'Recibimos tu solicitud. Inicia sesión antes de enviar futuras solicitudes para consultarlas en Mis solicitudes.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="form-grid">
        <label className="field">
          <span>Nombre completo</span>
          <input autoComplete="name" maxLength={120} minLength={2} name="nombreCompleto" required />
        </label>
        <label className="field">
          <span>Correo electrónico</span>
          <input autoComplete="email" maxLength={254} name="email" required type="email" />
        </label>
        <label className="field">
          <span>Empresa</span>
          <input autoComplete="organization" maxLength={160} name="empresa" />
        </label>
        <label className="field">
          <span>Teléfono</span>
          <input autoComplete="tel" maxLength={40} name="telefono" type="tel" />
        </label>
      </div>
      <label className="field">
        <span>Tipo de producto o caso</span>
        <select defaultValue="importaciones" name="tipoProducto" required>
          {productTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Describa brevemente su caso</span>
        <textarea maxLength={2000} minLength={1} name="descripcionCaso" required rows={5} />
      </label>
      {message && (
        <p className={`form-message ${sent ? 'form-message-success' : 'form-message-error'}`} role={sent ? 'status' : 'alert'}>
          {message}
        </p>
      )}
      <button className="button" disabled={submitting || authLoading} type="submit">
        {authLoading ? 'Verificando sesión…' : submitting ? 'Enviando…' : 'Enviar'}
      </button>
    </form>
  );
}
