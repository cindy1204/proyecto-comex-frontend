/**
 * Resuelve la URL de un archivo guardado por el backend.
 *
 * Las imágenes en Supabase llegan como URL absoluta (`https://...`) y se usan tal cual.
 * Las guardadas en la base de datos de la API llegan como ruta relativa (`/api/archivos/<id>`)
 * y necesitan el origen del backend. Se pasa `apiHost` como argumento para mantener la función pura.
 */
export function resolveMediaUrl(url: string | null, apiHost: string): string | null {
  if (!url) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return `${apiHost}${url}`;
  return url;
}
