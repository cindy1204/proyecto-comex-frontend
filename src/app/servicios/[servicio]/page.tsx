import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ServiceNumerals } from '@/features/services/service-numerals';
import { services } from '@/features/services/service-data';

export function generateStaticParams() {
  return services.map(({ slug }) => ({ servicio: slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ servicio: string }> },
): Promise<Metadata> {
  const { servicio: slug } = await params;
  const service = services.find((item) => item.slug === slug);
  return { title: service?.title ?? 'Servicio' };
}

export default function ServicePage(
  { params }: { params: Promise<{ servicio: string }> },
) {
  return (
    <Suspense fallback={<p className="notice">Cargando servicio…</p>}>
      <ServicePageContent params={params} />
    </Suspense>
  );
}

async function ServicePageContent(
  { params }: { params: Promise<{ servicio: string }> },
) {
  const { servicio: slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  return (
    <section className="section">
      <div className="section-container">
        <header className="page-heading">
          <p className="eyebrow">Servicio de comercio exterior</p>
          <h1>{service.title}</h1>
          <p>{service.description}</p>
        </header>
        <div className="hero-actions">
          <Link className="button" href={service.formHref}>Diligenciar formulario</Link>
          <Link className="button button-outline" href={`/contacto?tipoProducto=${service.contactType}`}>
            Solicitar asesoría
          </Link>
        </div>
        <section className="section">
          <header className="page-heading">
            <h2>Numerales cambiarios relacionados</h2>
            <p>Consulta los numerales asociados a este servicio.</p>
          </header>
          <ServiceNumerals service={service} />
        </section>
      </div>
    </section>
  );
}
