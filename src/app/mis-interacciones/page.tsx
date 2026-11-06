import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProtectedContent } from '@/features/auth/protected-content';
import { InteractionsList } from '@/features/interactions/interactions-list';
import { ContactRequestsList } from '@/features/contact/contact-requests-list';
import { AccountActions } from '@/features/interactions/account-actions';

export const metadata: Metadata = { title: 'Mis solicitudes' };

export default function MyInteractionsPage() {
  return (
    <section className="section">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Tu cuenta</p>
          <h1>Mis solicitudes</h1>
          <p>Elige si quieres revisar tus formularios diligenciados o iniciar uno nuevo.</p>
        </header>
        <Suspense fallback={<p className="notice">Cargando opciones…</p>}>
          <AccountActions />
        </Suspense>
        <ProtectedContent returnTo="/#servicios">
          <div id="formularios">
            <header className="page-heading">
              <h2>Formularios de importación y exportación</h2>
            </header>
            <InteractionsList />
            <ContactRequestsList />
          </div>
        </ProtectedContent>
      </div>
    </section>
  );
}
