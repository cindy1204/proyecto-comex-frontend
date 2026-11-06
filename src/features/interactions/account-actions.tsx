'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function AccountActions() {
  const searchParams = useSearchParams();
  const requestedPath = searchParams.get('continuar');
  const continueHref = isInternalPath(requestedPath) ? requestedPath : '/#servicios';

  return (
    <div className="hero-actions">
      <Link className="button" href={continueHref}>Diligenciar formulario</Link>
      <Link className="button button-outline" href="#formularios">Ver formularios diligenciados</Link>
    </div>
  );
}

function isInternalPath(value: string | null): value is string {
  return Boolean(value?.startsWith('/') && !value.startsWith('//'));
}
