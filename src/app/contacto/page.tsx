import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactForm } from '@/features/contact/contact-form';

export const metadata: Metadata = { title: 'Contáctenos' };

export default function ContactPage() {
  return (
    <section className="section section-muted">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Asesoría personalizada</p>
          <h1>Cuéntanos cómo podemos ayudarte</h1>
          <p>Completa estos datos y nuestro equipo revisará tu caso.</p>
        </header>
        <div className="form-card">
          <Suspense fallback={<p className="notice">Cargando formulario…</p>}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
