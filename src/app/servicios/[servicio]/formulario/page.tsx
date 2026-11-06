import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProtectedContent } from '@/features/auth/protected-content';
import { ServiceRequestForm } from '@/features/services/service-request-form';
import { services } from '@/features/services/service-data';

export function generateStaticParams() {
  return services
    .filter(({ slug }) => !['importaciones', 'exportaciones'].includes(slug))
    .map(({ slug }) => ({ servicio: slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ servicio: string }> },
): Promise<Metadata> {
  const { servicio: slug } = await params;
  const service = services.find((item) => item.slug === slug);
  return { title: service ? `Formulario de ${service.title.toLowerCase()}` : 'Formulario de servicio' };
}

export default function ServiceFormPage(
  { params }: { params: Promise<{ servicio: string }> },
) {
  return (
    <Suspense fallback={<p className="notice">Cargando formulario…</p>}>
      <ServiceFormPageContent params={params} />
    </Suspense>
  );
}

async function ServiceFormPageContent(
  { params }: { params: Promise<{ servicio: string }> },
) {
  const { servicio: slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service || ['importaciones', 'exportaciones'].includes(service.slug)) notFound();

  return (
    <section className="section section-muted">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">{service.title}</p>
          <h1>Formulario de operación</h1>
          <p>Cuéntanos los datos principales para registrar tu solicitud y orientarte sobre los siguientes pasos.</p>
        </header>
        <div className="form-card">
          <ProtectedContent returnTo={`/servicios/${service.slug}/formulario`}>
            <ServiceRequestForm service={service} />
          </ProtectedContent>
        </div>
      </div>
    </section>
  );
}
