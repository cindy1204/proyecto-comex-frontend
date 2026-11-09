import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { CatalogDetail } from '@/features/catalog/components/catalog-detail';
import { getPublicCatalogItem } from '@/features/catalog/services/catalog.service';
import { isCuid } from '@/features/common/domain/id';
import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { getTranslations } from '@/features/i18n/services/get-translations';
import { Container } from '@/features/common/components/container';

type CatalogParams = Promise<{ id: string }>;

/**
 * Con Cache Components, `generateStaticParams` debe devolver al menos un valor. Este id no es un
 * cuid válido: se resuelve como 404 en el build sin consultar el backend; el resto de ids se
 * renderizan por petición.
 */
export function generateStaticParams() {
  return [{ id: 'no-existe' }];
}

/** Un id con formato inválido es 404 sin ir al backend; `cache` evita pedirlo dos veces (metadatos y página). */
const loadItem = cache(async (id: string) => (isCuid(id) ? getPublicCatalogItem(id) : null));

export async function generateMetadata({ params }: { params: CatalogParams }): Promise<Metadata> {
  const { id } = await params;
  const [item, { t }] = await Promise.all([loadItem(id), getTranslations()]);
  return { title: item ? `${item.code} · ${item.title}` : t('catalog.notFoundTitle') };
}

/** `notFound()` muestra la página 404; con id de formato inválido el estado HTTP también es 404. */
async function CatalogItemContent({ params }: { params: CatalogParams }) {
  const { id } = await params;
  const item = await loadItem(id);
  if (!item) notFound();

  return (
    <Container className="py-10">
      <CatalogDetail item={item} />
    </Container>
  );
}

export default function CatalogItemPage({ params }: { params: CatalogParams }) {
  return (
    <RequestBoundary>
      <CatalogItemContent params={params} />
    </RequestBoundary>
  );
}
