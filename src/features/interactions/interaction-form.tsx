'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { ApiError, apiRequest } from '@/lib/api';

interface CatalogItem {
  id: string;
  code: string;
  title: string;
}

type OperationType = 'formulario-importaciones' | 'formulario-exportaciones';
interface FormField {
  name: string;
  label: string;
  type?: 'date' | 'identification' | 'number' | 'textarea';
  placeholder?: string;
  required: boolean;
}

const identificationTypes = ['NIT', 'Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte'];
const importDocuments: Record<string, string[]> = {
  '2015': ['BL (documento de transporte)'],
  '2017': ['Factura comercial o proforma'],
  '2022': ['Factura comercial', 'Declaración de importación (DIM)'],
  '2023': ['Factura comercial', 'Declaración de importación (DIM)'],
  '2024': ['Factura comercial', 'Declaración de importación (DIM)'],
  '2025': ['Factura comercial', 'Declaración de importación (DIM)'],
};
const exportDocuments: Record<string, string[]> = {
  '1045': ['Factura comercial o proforma'],
  '1050': ['Factura comercial o proforma'],
  '1510': [],
};

const importFields: FormField[] = [
  { name: 'fechaTramite', label: 'Fecha del trámite', type: 'date', required: true },
  { name: 'tipoIdentificacion', label: 'Tipo de identificación', type: 'identification', required: true },
  { name: 'identificacion', label: 'Número de identificación', required: true },
  { name: 'nombreImportador', label: 'Nombre o razón social del importador', required: true },
  { name: 'monedaNegociacion', label: 'Moneda de negociación', placeholder: 'Ej. USD', required: true },
  { name: 'valorMonedaNegociacion', label: 'Valor total en moneda de negociación', type: 'number', required: true },
  { name: 'tipoCambioDolar', label: 'Tipo de cambio a dólar', type: 'number', required: true },
  { name: 'valorTotalDolares', label: 'Valor total en dólares', type: 'number', required: true },
  { name: 'numeroDeclaracionFactura', label: 'Número de DIM y/o factura comercial', required: true },
  { name: 'valorFob', label: 'Valor FOB en dólares', type: 'number', required: true },
  { name: 'beneficiarioExterior', label: 'Nombre del beneficiario del giro en el exterior', required: true },
  { name: 'ciudadExterior', label: 'Ciudad destino del giro', required: true },
  { name: 'paisExterior', label: 'País destino del giro', required: true },
  { name: 'observaciones', label: 'Observaciones o instrucciones', type: 'textarea', required: false },
  { name: 'nombreDeclarante', label: 'Nombre del declarante', required: true },
];

const exportFields: FormField[] = [
  { name: 'fechaTramite', label: 'Fecha del trámite', type: 'date', required: true },
  { name: 'tipoIdentificacion', label: 'Tipo de identificación', type: 'identification', required: true },
  { name: 'identificacion', label: 'Número de identificación', required: true },
  { name: 'nombreExportador', label: 'Nombre o razón social del exportador', required: true },
  { name: 'monedaNegociacion', label: 'Código moneda de negociación', placeholder: 'Ej. USD', required: true },
  { name: 'valorMonedaNegociacion', label: 'Valor total en moneda de negociación', type: 'number', required: true },
  { name: 'tasaCambioDolares', label: 'Tasa de cambio a dólares', type: 'number', required: true },
  { name: 'valorTotalDolares', label: 'Valor total en dólares', type: 'number', required: true },
  { name: 'numeroDocumento', label: 'Número de DEX y/o factura', required: true },
  { name: 'valorReintegrado', label: 'Valor reintegrado DEX/factura en USD', type: 'number', required: true },
  { name: 'totalValorFob', label: 'Total valor FOB (USD)', type: 'number', required: true },
  { name: 'totalGastosExportacion', label: 'Total gastos de exportación (USD)', type: 'number', required: true },
  { name: 'deducciones', label: 'Deducciones (USD)', type: 'number', required: true },
  { name: 'observaciones', label: 'Observaciones', type: 'textarea', required: false },
  { name: 'nombreDeclarante', label: 'Nombre del declarante', required: true },
];

export function InteractionForm({ type }: Readonly<{ type: OperationType }>) {
  const { token, logout } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isImport = type === 'formulario-importaciones';
  const numeralField = isImport ? 'numeralOperacion' : 'numeralCambiario';
  const fields = isImport ? importFields : exportFields;
  const category = isImport ? 'importaciones' : 'exportaciones';
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [netAmount, setNetAmount] = useState('0.00');
  const [submittedData, setSubmittedData] = useState<Record<string, FormDataEntryValue> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void apiRequest<{ data: CatalogItem[] }>(
      `/api/catalogo?page=1&pageSize=100&category=${category}`,
      { signal: controller.signal },
    )
      .then((result) => setCatalog(result.data))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el catálogo.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCatalog(false);
      });
    return () => controller.abort();
  }, [category]);

  const selectedDocuments = useMemo(() => {
    if (!selectedCode) return null;
    if (isImport) return importDocuments[selectedCode] ?? null;
    return exportDocuments[selectedCode] ?? ['Factura comercial', 'Declaración de exportación (DEX)'];
  }, [isImport, selectedCode]);

  function calculateNet(form: HTMLFormElement) {
    const values = new FormData(form);
    const toCents = (name: string) => {
      const value = Number(values.get(name));
      return Number.isFinite(value) ? Math.round(value * 100) : 0;
    };
    const result = (
      toCents('totalValorFob') + toCents('totalGastosExportacion') - toCents('deducciones')
    ) / 100;
    return result.toFixed(2);
  }

  function updateNetAmount() {
    if (formRef.current) setNetAmount(calculateNet(formRef.current));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (!isImport) data.reintegroNetoCalculado = calculateNet(event.currentTarget);

    try {
      await apiRequest('/api/interaccion', {
        method: 'POST',
        token: token ?? undefined,
        body: { type, data },
      });
      setSubmittedData(data);
      setMessage('Solicitud guardada. Puedes imprimir esta copia para tus soportes.');
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        logout();
        router.replace('/login');
        return;
      }
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar la solicitud.');
    } finally {
      setSaving(false);
    }
  }

  const selectedItem = catalog.find((item) => item.code === selectedCode);

  return (
    <>
      <form className="form-stack operation-form" onInput={!isImport ? updateNetAmount : undefined} onSubmit={submit} ref={formRef}>
        <div className="form-grid">
          {fields.map((field) => (
            <label className="field" key={field.name}>
              <span>{field.label}</span>
              {field.type === 'identification' ? (
                <select defaultValue="" name={field.name} required>
                  <option disabled value="">Selecciona el tipo</option>
                  {identificationTypes.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea maxLength={2000} name={field.name} required={field.required} rows={3} />
              ) : (
                <input
                  maxLength={field.type === 'number' ? undefined : 250}
                  min={field.type === 'number' ? 0 : undefined}
                  name={field.name}
                  placeholder={'placeholder' in field ? field.placeholder : undefined}
                  required={field.required}
                  step={field.type === 'number' ? 'any' : undefined}
                  type={'type' in field ? field.type : 'text'}
                />
              )}
            </label>
          ))}
          <label className="field">
            <span>Numeral cambiario</span>
            <select
              disabled={loadingCatalog || catalog.length === 0}
              name={numeralField}
              onChange={(event) => setSelectedCode(event.target.value)}
              required
              value={selectedCode}
            >
              <option value="">{loadingCatalog ? 'Cargando numerales…' : 'Selecciona un numeral'}</option>
              {catalog.map((item) => <option key={item.id} value={item.code}>{item.code} · {item.title}</option>)}
            </select>
          </label>
        </div>

        {selectedDocuments && selectedItem && (
          <aside className="notice" aria-live="polite">
            <strong>Documentos sugeridos para el numeral {selectedCode}</strong>
            {selectedDocuments.length ? (
              <ul>{selectedDocuments.map((document) => <li key={document}>{document}</li>)}</ul>
            ) : <p>No se solicita factura ni DEX para este numeral.</p>}
            {!isImport && ['1045', '1050', '1510'].includes(selectedCode) && (
              <p>Estos numerales no legalizan factura.</p>
            )}
          </aside>
        )}

        {!isImport && <p className="notice">Reintegro neto calculado: <strong>USD {netAmount}</strong></p>}
        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        {message && <p className="form-message form-message-success" role="status">{message}</p>}
        <button className="button" disabled={saving || loadingCatalog || catalog.length === 0} type="submit">
          {saving ? 'Guardando…' : 'Guardar solicitud'}
        </button>
      </form>

      {submittedData && (
        <section className="submitted-summary" aria-label="Copia de la solicitud guardada">
          <div className="interaction-heading">
            <h2>Resumen de la solicitud</h2>
            <button className="button button-outline" onClick={() => window.print()} type="button">Imprimir / Guardar PDF</button>
          </div>
          <dl className="summary-grid">
            {Object.entries(submittedData).map(([key, value]) => (
              <div key={key}>
                <dt>{key === numeralField ? `Numeral ${value}` : key}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
            <div><dt>Descripción del numeral</dt><dd>{selectedItem?.title}</dd></div>
          </dl>
        </section>
      )}
    </>
  );
}
