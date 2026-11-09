/**
 * Compone la descripción del caso con los datos del formulario genérico de servicio.
 *
 * Este texto se guarda en el backend y lo lee el equipo asesor (en español), por eso las
 * etiquetas no dependen del idioma de la interfaz. `serviceTitle` es el nombre canónico en español.
 */
export function buildServiceRequestDescription(serviceTitle: string, values: FormData): string {
  const read = (name: string) => String(values.get(name) ?? '').trim();
  return [
    `Servicio: ${serviceTitle}`,
    read('numeral') && `Numeral cambiario: ${read('numeral')}`,
    read('pais') && `País relacionado: ${read('pais')}`,
    read('descripcionCaso'),
  ]
    .filter(Boolean)
    .join('\n');
}
