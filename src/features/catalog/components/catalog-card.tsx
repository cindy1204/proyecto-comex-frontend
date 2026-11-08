'use client';

import Link from 'next/link';
import { Badge } from '../../common/components/badge';
import { NumeralCode } from '../../common/components/numeral-code';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { catalogItemPath, type CatalogItem } from '../domain/catalog';
import { CatalogImage } from './catalog-image';

export function CatalogCard({ item }: Readonly<{ item: CatalogItem }>) {
  const { t } = useTranslation();

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <CatalogImage
        alt={t('catalog.imageAlt', { code: item.code })}
        className="aspect-video w-full"
        src={item.imageUrl}
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <NumeralCode code={item.code} />
          <Badge tone={item.direction === 'INGRESOS' ? 'success' : 'warning'}>
            {t(`catalog.directions.${item.direction}`)}
          </Badge>
        </div>
        <h3 className="type-subtitle text-foreground">{item.title}</h3>
        <p className="line-clamp-4 text-muted-foreground">{item.description}</p>
        <Link
          className="mt-auto inline-flex min-h-11 items-center self-start text-sm font-semibold text-primary underline underline-offset-2"
          href={catalogItemPath(item.id)}
        >
          {t('catalog.viewDetail')}
          <span className="sr-only"> {t('catalog.viewDetailSr', { code: item.code })}</span>
        </Link>
      </div>
    </article>
  );
}
