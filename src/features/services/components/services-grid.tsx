import { SERVICES } from '../domain/services';
import { ServiceCard } from './service-card';

export function ServicesGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((service) => (
        <li key={service.slug}>
          <ServiceCard service={service} />
        </li>
      ))}
    </ul>
  );
}
