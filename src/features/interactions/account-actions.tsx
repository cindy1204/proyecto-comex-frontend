'use client';

import Link from 'next/link';
import { services } from '@/features/services/service-data';

export function AccountActions() {
  return (
    <section className="account-form-options" id="diligenciar">
      <header className="page-heading">
        <h2>Diligenciar formularios</h2>
        <p>Selecciona el tipo de operación para completar y guardar una solicitud en tu cuenta.</p>
      </header>
      <div className="service-grid">
        {services.map((service) => (
          <Link className="service-card" href={service.formHref} key={service.code}>
            <span className="service-icon">{service.code}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <span className="account-form-link">Abrir formulario</span>
          </Link>
        ))}
      </div>
      <p className="hero-actions">
        <Link className="button button-outline" href="#formularios">Ver formularios diligenciados</Link>
      </p>
    </section>
  );
}
