import type { Metadata } from 'next';
import { ProtectedContent } from '@/features/auth/protected-content';
import { InteractionsList } from '@/features/interactions/interactions-list';
import { ContactRequestsList } from '@/features/contact/contact-requests-list';
import { AccountActions } from '@/features/interactions/account-actions';

export const metadata: Metadata = { title: 'Mis solicitudes' };

export default function MyInteractionsPage() {
  return (
    <section className="section">
      <div className="section-container">
        <ProtectedContent returnTo="/mis-interacciones">
          <header className="page-heading">
            <p className="eyebrow">Tu cuenta</p>
            <h1>Mis solicitudes</h1>
            <p>Desde aquí puedes diligenciar formularios y consultar tus solicitudes guardadas.</p>
          </header>
          <AccountActions />
          <div id="formularios">
            <header className="page-heading">
              <h2>Formularios diligenciados</h2>
              <p>Revisa las solicitudes que ya guardaste en tu cuenta.</p>
            </header>
            <InteractionsList />
            <ContactRequestsList />
          </div>
        </ProtectedContent>
      </div>
    </section>
  );
}
