import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="not-found">
      <p className="eyebrow">Error 404</p>
      <h1 className="page-heading">No encontramos esta página</h1>
      <p className="muted">El enlace puede estar escrito de forma incorrecta o ya no estar disponible.</p>
      <Link className="button" href="/">Volver al inicio</Link>
    </section>
  );
}
