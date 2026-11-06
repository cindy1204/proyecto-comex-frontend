export const services = [
  {
    slug: 'importaciones',
    code: 'IM',
    title: 'Importaciones de bienes',
    description: 'Asesoría para pagar importaciones y cumplir con los trámites cambiarios.',
    catalogCategory: 'importaciones',
    contactType: 'importaciones',
    formHref: '/importaciones',
  },
  {
    slug: 'exportaciones',
    code: 'EX',
    title: 'Exportaciones de bienes',
    description: 'Acompañamiento para gestionar los reintegros y obligaciones de exportación.',
    catalogCategory: 'exportaciones',
    contactType: 'exportaciones',
    formHref: '/exportaciones',
  },
  {
    slug: 'servicios',
    code: 'SE',
    title: 'Servicios y transferencias',
    description: 'Orientación para pagos internacionales por servicios y otros conceptos.',
    catalogCategory: 'servicios',
    contactType: 'servicios',
    formHref: '/servicios/servicios/formulario',
  },
  {
    slug: 'inversiones',
    code: 'II',
    title: 'Inversiones internacionales',
    description: 'Apoyo para comprender y registrar operaciones de inversión internacional.',
    catalogCategory: 'inversiones',
    contactType: 'inversiones',
    formHref: '/servicios/inversiones/formulario',
  },
  {
    slug: 'endeudamiento',
    code: 'DE',
    title: 'Endeudamiento externo',
    description: 'Asesoría sobre financiación, avales y garantías con alcance internacional.',
    catalogCategory: 'endeudamiento',
    contactType: 'deudaExterna',
    formHref: '/servicios/endeudamiento/formulario',
  },
] as const;

export type Service = (typeof services)[number];
