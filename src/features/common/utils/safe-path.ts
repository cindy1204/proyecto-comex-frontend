/** Acepta solo rutas internas (`/algo`), para evitar redirecciones abiertas con `returnTo`. */
export function toSafeInternalPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  return value;
}

/** Como `toSafeInternalPath`, pero devuelve `undefined` cuando no hay un destino explícito y válido. */
export function toOptionalSafePath(value: string | null | undefined): string | undefined {
  const path = toSafeInternalPath(value, '');
  return path === '' ? undefined : path;
}
