/** Acepta solo rutas internas (`/algo`), para evitar redirecciones abiertas con `returnTo`. */
export function toSafeInternalPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  return value;
}
