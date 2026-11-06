'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { ApiError, apiRequest } from '@/lib/api';
import type { Service } from './service-data';

interface CatalogItem {
  id: string;
  code: string;
  title: string;
}

export function ServiceRequestForm({ service }: Readonly<{ service: Service }>) {
  const { token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [numerals, setNumerals] = useState<CatalogItem[]>([]);
  const [loadingNumerals, setLoadingNumerals] = useState(Boolean(service.catalogCategory));
  const [numeralError, setNumeralError] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!service.catalogCategory) return;

    const controller = new AbortController();
    apiRequest<{ data: CatalogItem[] }>(
      `/api/catalogo?page=1&pageSize=100&category=${encodeURIComponent(service.catalogCategory)}`,
      { signal: controller.signal },
    )
      .then((result) => setNumerals(result.data))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setNumeralError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los numerales.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingNumerals(false);
      });

    return () => controller.abort();
  }, [service.catalogCategory]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSent(false);
    setSubmitting(true);

    const form = event.currentTarget;
    const values = new FormData(form);
    const details = [
      `Servicio: ${service.title}`,
      values.get('numeral') ? `Numeral cambiario: ${values.get('numeral')}` : '',
      values.get('pais') ? `País relacionado: ${values.get('pais')}` : '',
      values.get('moneda') ? `Moneda: ${values.get('moneda')}` : '',
      values.get('valor') ? `Valor aproximado: ${values.get('valor')}` : '',
      String(values.get('descripcionCaso') ?? '').trim(),
    ].filter(Boolean).join('\n');

    try {
      if (!token) throw new Error('Inicia sesión para guardar tu formulario.');
      await apiRequest('/api/contacto/formularios', {
        method: 'POST',
        token,
        body: {
          nombreCompleto: values.get('nombreCompleto'),
          email: values.get('email'),
          empresa: values.get('empresa'),
          telefono: values.get('telefono'),
          tipoProducto: service.contactType,
          descripcionCaso: details,
        },
      });
      form.reset();
      setSent(true);
      setMessage('Formulario enviado y guardado en tu cuenta.');
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        logout();
        router.replace(`/login?returnTo=${encodeURIComponent(service.formHref)}`);
        return;
      }
      setMessage(requestError instanceof Error ? requestError.message : 'No se pudo enviar el formulario.');
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
        <label className="field">
          <span>País relacionado con la operación</span>
          <input maxLength={100} name="pais" />
        </label>
        <label className="field">
          <span>Moneda</span>
          <input maxLength={10} name="moneda" placeholder="Ej. USD" />
        </label>
        <label className="field">
          <span>Valor aproximado</span>
          <input min="0" name="valor" step="any" type="number" />
        </label>
        {service.catalogCategory && (
          <label className="field">
            <span>Numeral cambiario (opcional)</span>
            <select disabled={loadingNumerals || Boolean(numeralError)} name="numeral">
              <option value="">
                {loadingNumerals ? 'Cargando numerales…' : numeralError ? 'No se pudieron cargar' : 'Selecciona un numeral'}
              </option>
              {numerals.map((numeral) => (
                <option key={numeral.id} value={`${numeral.code} · ${numeral.title}`}>
                  {numeral.code} · {numeral.title}
                </option>
              ))}
            </select>
            {numeralError && <span className="field-error" role="alert">{numeralError}</span>}
          </label>
        )}
      </div>
      <label className="field">
        <span>Describe la operación o consulta</span>
        <textarea maxLength={1500} minLength={1} name="descripcionCaso" required rows={5} />
      </label>
      {message && (
        <p className={`form-message ${sent ? 'form-message-success' : 'form-message-error'}`} role={sent ? 'status' : 'alert'}>
          {message}
        </p>
      )}
      {sent && <Link className="button button-outline" href="/mis-interacciones">Ver formularios diligenciados</Link>}
      <button className="button" disabled={submitting || authLoading || loadingNumerals || Boolean(numeralError)} type="submit">
        {authLoading ? 'Verificando sesión…' : submitting ? 'Enviando…' : 'Enviar formulario'}
      </button>
    </form>
  );
}
