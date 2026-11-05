import type { Metadata } from 'next';
import { ProtectedContent } from '@/features/auth/protected-content';
import { InteractionsList } from '@/features/interactions/interactions-list';

export const metadata: Metadata = { title: 'Administración de solicitudes' };

export default function AdminInteractionsPage() {
  return (
    <section className="section admin-page">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Administración</p>
          <h1>Solicitudes recibidas</h1>
          <p>Vista administrativa de las interacciones registradas por las cuentas.</p>
        </header>
        <ProtectedContent requiredRole="admin"><InteractionsList admin /></ProtectedContent>
      </div>
    </section>
  );
}
