import type { Metadata } from 'next';
import { ProtectedContent } from '@/features/auth/protected-content';
import { InteractionForm } from '@/features/interactions/interaction-form';

export const metadata: Metadata = { title: 'Formulario de importaciones' };

export default function ImportationsPage() {
  return (
    <section className="section section-muted">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Importaciones de bienes · Anexo 3 · DCIP-83</p>
          <h1>Formulario de importaciones</h1>
          <p>Registra la información principal de la operación. Selecciona un numeral activo del catálogo para guardar tu solicitud.</p>
        </header>
        <div className="form-card">
          <ProtectedContent><InteractionForm type="formulario-importaciones" /></ProtectedContent>
        </div>
      </div>
    </section>
  );
}
