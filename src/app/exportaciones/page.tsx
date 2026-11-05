import type { Metadata } from 'next';
import { ProtectedContent } from '@/features/auth/protected-content';
import { InteractionForm } from '@/features/interactions/interaction-form';

export const metadata: Metadata = { title: 'Formulario de exportaciones' };

export default function ExportationsPage() {
  return (
    <section className="section section-muted">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Exportaciones de bienes · Anexo 3 · DCIP-83</p>
          <h1>Formulario de exportaciones</h1>
          <p>Registra tu operación, calcula el reintegro neto y consulta los documentos sugeridos para el numeral cambiario.</p>
        </header>
        <div className="form-card">
          <ProtectedContent><InteractionForm type="formulario-exportaciones" /></ProtectedContent>
        </div>
      </div>
    </section>
  );
}
