import type { CatalogCategory } from '../../catalog/domain/catalog';
import type { ContactProductType } from '../../contact/domain/contact';
import type { DeclarationType } from '../../interactions/domain/interaction';

export type ServiceSlug =
  'importaciones' | 'exportaciones' | 'servicios' | 'inversiones' | 'endeudamiento';

/**
 * Datos técnicos de cada servicio. El título y la descripción visibles viven en los diccionarios
 * (`services.items.<slug>.title|description`).
 */
export interface Service {
  slug: ServiceSlug;
  code: string;
  catalogCategory: CatalogCategory;
  contactType: ContactProductType;
  /** Formulario propio del servicio. */
  formHref: string;
  /** `true` si el formulario es la solicitud genérica `/servicios/[slug]/formulario`. */
  usesGenericForm: boolean;
  /**
   * Familia de declaración de cambio (hoja de datos mínimos) en `/servicios/[slug]/declaracion`.
   * Solo existe para las familias que no tienen formulario oficial propio en el portal.
   */
  declarationType?: DeclarationType;
}

export const SERVICES: readonly Service[] = [
  {
    slug: 'importaciones',
    code: 'IM',
    catalogCategory: 'importaciones',
    contactType: 'importaciones',
    formHref: '/importaciones',
    usesGenericForm: false,
  },
  {
    slug: 'exportaciones',
    code: 'EX',
    catalogCategory: 'exportaciones',
    contactType: 'exportaciones',
    formHref: '/exportaciones',
    usesGenericForm: false,
  },
  {
    slug: 'servicios',
    code: 'SE',
    catalogCategory: 'servicios',
    contactType: 'servicios',
    formHref: '/servicios/servicios/formulario',
    usesGenericForm: true,
    declarationType: 'formulario-servicios',
  },
  {
    slug: 'inversiones',
    code: 'II',
    catalogCategory: 'inversiones',
    contactType: 'inversiones',
    formHref: '/servicios/inversiones/formulario',
    usesGenericForm: true,
    declarationType: 'formulario-inversiones',
  },
  {
    slug: 'endeudamiento',
    code: 'DE',
    catalogCategory: 'endeudamiento',
    contactType: 'deudaExterna',
    formHref: '/servicios/endeudamiento/formulario',
    usesGenericForm: true,
    declarationType: 'formulario-endeudamiento',
  },
];

export function findService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

/** Servicios cuyo formulario es `/servicios/[slug]/formulario`. */
export const GENERIC_FORM_SERVICES = SERVICES.filter((service) => service.usesGenericForm);

/** Servicios con hoja de datos mínimos en `/servicios/[slug]/declaracion`. */
export const DECLARATION_SERVICES = SERVICES.filter((service) => service.declarationType);
