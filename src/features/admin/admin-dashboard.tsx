'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError, apiRequest } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';
import { CatalogImageManager } from './catalog-image-manager';

interface ContactRequest {
  id: string;
  nombreCompleto: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
  tipoProducto: string;
  descripcionCaso: string;
  createdAt: string;
}

interface ContactRequestsPage {
  data: ContactRequest[];
  pagination: { total: number; currentPage: number; limit: number; totalPages: number };
}

const productLabels: Record<string, string> = {
  importaciones: 'Importaciones de bienes',
  exportaciones: 'Exportaciones de bienes',
  deudaExterna: 'Endeudamiento externo, avales y garantías',
  inversiones: 'Inversiones internacionales',
  servicios: 'Servicios, transferencias y otros conceptos',
};

export function AdminDashboard() {
  const { user, token, loading: authLoading, error: authError, login, logout, restoreSession } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [contactsPagination, setContactsPagination] = useState<ContactRequestsPage['pagination'] | null>(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loginError, setLoginError] = useState('');
  const [adminMessage, setAdminMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<'user' | 'admin'>('user');
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsType, setContactsType] = useState('');
  const [contactsSearch, setContactsSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  function closeAdminSession() {
    logout();
    router.push('/');
  }

  const loadContacts = useCallback(async (signal: AbortSignal) => {
    if (!token || user?.role !== 'admin') return;

    setContactsLoading(true);
    setContactsError('');
    try {
      const query = new URLSearchParams({ currentPage: String(contactsPage), limit: '10' });
      if (contactsType) query.set('tipoProducto', contactsType);
      if (appliedSearch) query.set('search', appliedSearch);
      const result = await apiRequest<ContactRequestsPage>(`/api/solicitudes-contacto?${query}`, { token, signal });
      setContacts(result.data);
      setContactsPagination(result.pagination);
    } catch (error) {
      if (signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) {
        logout();
        setContactsError('Tu sesión venció. Inicia sesión de nuevo.');
      } else {
        setContactsError(error instanceof Error ? error.message : 'No se pudieron cargar las solicitudes.');
      }
    } finally {
      if (!signal.aborted) setContactsLoading(false);
    }
  }, [token, user?.role, logout, contactsPage, contactsType, appliedSearch]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') return;
    const controller = new AbortController();
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadContacts(controller.signal);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [token, user?.role, refreshKey, loadContacts]);

  function applyContactFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactsPage(1);
    setAppliedSearch(contactsSearch.trim());
    setContactsLoading(true);
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await login(String(formData.get('email') ?? '').trim(), String(formData.get('password') ?? ''));
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoginSubmitting(false);
    }
  }

  async function submitAccountRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminMessage(null);
    setAdminSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await apiRequest(registrationRole === 'admin' ? '/api/auth/admins' : '/api/auth/register', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name: String(formData.get('name') ?? '').trim(),
          email: String(formData.get('email') ?? '').trim(),
          password: String(formData.get('password') ?? ''),
        },
      });
      form.reset();
      setAdminMessage({
        text: registrationRole === 'admin'
          ? 'La cuenta de administrador se creó correctamente.'
          : 'La cuenta de usuario se creó correctamente.',
        success: true,
      });
    } catch (error) {
      setAdminMessage({
        text: error instanceof Error ? error.message : 'No se pudo crear la cuenta.',
        success: false,
      });
    } finally {
      setAdminSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <section className="section section-muted">
        <div className="section-container"><p className="notice">Verificando acceso…</p></div>
      </section>
    );
  }

  if (authError && !user) {
    return (
      <section className="section section-muted">
        <div className="section-container">
          <div className="notice notice-error" role="alert">
            <p>{authError}</p>
            <button className="button button-outline" onClick={() => void restoreSession()} type="button">
              Volver a intentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section section-muted">
        <div className="section-container">
          <div className="form-card account-card">
            <p className="eyebrow">Área restringida</p>
            <h1>Administración</h1>
            <p className="muted">Ingresa con una cuenta de administrador para consultar las solicitudes de contacto.</p>
            <form className="form-stack" onSubmit={submitLogin}>
              <label className="field">
                <span>Correo electrónico</span>
                <input autoComplete="username" maxLength={254} name="email" required type="email" />
              </label>
              <label className="field">
                <span>Contraseña</span>
                <input autoComplete="current-password" maxLength={128} name="password" required type="password" />
              </label>
              {loginError && <p className="form-message form-message-error" role="alert">{loginError}</p>}
              <button className="button button-wide" disabled={loginSubmitting} type="submit">
                {loginSubmitting ? 'Ingresando…' : 'Ingresar como administrador'}
              </button>
            </form>
            <p className="form-switch"><Link href="/login">Ir al ingreso de clientes</Link></p>
          </div>
        </div>
      </section>
    );
  }

  if (user.role !== 'admin') {
    return (
      <section className="section">
        <div className="section-container">
          <div className="notice notice-error" role="alert">
            <p>La cuenta {user.email} no tiene permisos de administrador.</p>
            <button className="button button-outline" onClick={() => void restoreSession()} type="button">
              Actualizar permisos
            </button>
            <button className="button button-outline" onClick={closeAdminSession} type="button">Cerrar sesión</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section section-muted">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Área restringida</p>
          <h1>Solicitudes de contacto</h1>
          <p>Personas y empresas que enviaron una solicitud desde el formulario de contacto.</p>
        </header>

        <div className="admin-toolbar">
          <span className="muted">Sesión: {user.email}</span>
          <div>
            <button className="button button-outline" onClick={() => setRefreshKey((key) => key + 1)} type="button">
              Actualizar solicitudes
            </button>
            <Link className="button button-outline" href="/admin/interacciones">Ver interacciones</Link>
            <button className="button button-outline" onClick={closeAdminSession} type="button">Cerrar sesión</button>
          </div>
        </div>

        <form className="catalog-filters" onSubmit={applyContactFilters}>
          <label className="field filter-search">
            <span>Buscar por nombre o correo</span>
            <input maxLength={200} onChange={(event) => setContactsSearch(event.target.value)} value={contactsSearch} />
          </label>
          <label className="field filter-category">
            <span>Filtrar por caso</span>
            <select onChange={(event) => { setContactsType(event.target.value); setContactsPage(1); setContactsLoading(true); }} value={contactsType}>
              <option value="">Todos los casos</option>
              {Object.entries(productLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button className="button filter-button" type="submit">Buscar</button>
        </form>

        {contactsLoading && <p className="notice">Cargando solicitudes…</p>}
        {contactsError && (
          <div className="notice notice-error" role="alert">
            <p>{contactsError}</p>
            <button className="button button-outline" onClick={() => setRefreshKey((key) => key + 1)} type="button">
              Reintentar
            </button>
          </div>
        )}
        {!contactsLoading && !contactsError && contacts.length === 0 && (
          <p className="notice">Aún no hay solicitudes de contacto.</p>
        )}
        {!contactsLoading && !contactsError && contacts.length > 0 && (
          <div className="admin-contacts-table-wrapper">
            <table className="admin-contacts-table">
              <colgroup>
                <col className="admin-contact-date-column" />
                <col className="admin-contact-name-column" />
                <col className="admin-contact-email-column" />
                <col className="admin-contact-phone-column" />
                <col className="admin-contact-company-column" />
                <col className="admin-contact-case-column" />
                <col className="admin-contact-description-column" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Empresa</th>
                  <th scope="col">Caso</th>
                  <th scope="col">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <time dateTime={contact.createdAt}>
                        {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(contact.createdAt))}
                      </time>
                    </td>
                    <td>{contact.nombreCompleto}</td>
                    <td><a href={`mailto:${contact.email}`}>{contact.email}</a></td>
                    <td>
                      {contact.telefono
                        ? <a className="admin-contact-phone" href={`tel:${contact.telefono}`}>{contact.telefono}</a>
                        : 'No indicado'}
                    </td>
                    <td>{contact.empresa || 'No indicada'}</td>
                    <td>{productLabels[contact.tipoProducto] ?? contact.tipoProducto}</td>
                    <td>
                      <details>
                        <summary>Ver caso</summary>
                        <p className="contact-request-description">{contact.descripcionCaso}</p>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!contactsLoading && !contactsError && contactsPagination && (
          <div className="pagination">
            <span>{contactsPagination.total} solicitudes · Página {contactsPagination.currentPage} de {Math.max(contactsPagination.totalPages, 1)}</span>
            <div className="pagination-actions">
              <button className="button button-outline" disabled={contactsPage <= 1} onClick={() => { setContactsPage((page) => page - 1); setContactsLoading(true); }} type="button">Anterior</button>
              <button className="button button-outline" disabled={contactsPage >= contactsPagination.totalPages} onClick={() => { setContactsPage((page) => page + 1); setContactsLoading(true); }} type="button">Siguiente</button>
            </div>
          </div>
        )}

        <CatalogImageManager />

        <section className="admin-register-section">
          <button
            aria-controls="admin-account-registration"
            aria-expanded={showRegistrationForm}
            className="button"
            onClick={() => setShowRegistrationForm((visible) => !visible)}
            type="button"
          >
            {showRegistrationForm ? 'Cerrar registro de usuario' : 'Registrar usuario'}
          </button>
          {showRegistrationForm && (
            <div className="form-card admin-register-card" id="admin-account-registration">
              <p className="eyebrow">Gestión de acceso</p>
              <h2>Registrar cuenta</h2>
              <p className="muted">Selecciona si la cuenta tendrá acceso de usuario o de administrador.</p>
              <form className="form-stack" onSubmit={submitAccountRegistration}>
                <label className="field">
                  <span>Tipo de cuenta</span>
                  <select
                    name="role"
                    onChange={(event) => {
                      setRegistrationRole(event.target.value === 'admin' ? 'admin' : 'user');
                      setAdminMessage(null);
                    }}
                    value={registrationRole}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Nombre completo</span>
                    <input autoComplete="name" maxLength={120} minLength={2} name="name" required />
                  </label>
                  <label className="field">
                    <span>Correo electrónico</span>
                    <input autoComplete="email" maxLength={254} name="email" required type="email" />
                  </label>
                </div>
                <label className="field">
                  <span>Contraseña (mínimo {registrationRole === 'admin' ? 12 : 8} caracteres)</span>
                  <input
                    autoComplete="new-password"
                    maxLength={128}
                    minLength={registrationRole === 'admin' ? 12 : 8}
                    name="password"
                    required
                    type="password"
                  />
                </label>
                {adminMessage && (
                  <p
                    className={`form-message ${adminMessage.success ? 'form-message-success' : 'form-message-error'}`}
                    role={adminMessage.success ? 'status' : 'alert'}
                  >
                    {adminMessage.text}
                  </p>
                )}
                <button className="button" disabled={adminSubmitting} type="submit">
                  {adminSubmitting
                    ? 'Registrando…'
                    : `Registrar ${registrationRole === 'admin' ? 'administrador' : 'usuario'}`}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
