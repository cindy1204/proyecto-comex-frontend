import type { Metadata } from 'next';
import { ProtectedContent } from '@/features/auth/protected-content';
import { InteractionsList } from '@/features/interactions/interactions-list';
import { ContactRequestsList } from '@/features/contact/contact-requests-list';

export const metadata: Metadata = { title: 'Mis solicitudes' };

export default function MyInteractionsPage() {
  return (
    <section className="section">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Tu cuenta</p>
          <h1>Mis solicitudes</h1>
          <p>Consulta tus solicitudes de importación, exportación y contacto.</p>
        </header>
        <ProtectedContent>
          <InteractionsList />
          <ContactRequestsList />
        </ProtectedContent>
      </div>
    </section>
  );
}
