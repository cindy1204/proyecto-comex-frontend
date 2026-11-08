'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '../../common/components/badge';
import { buttonStyles } from '../../common/components/button';
import { Card } from '../../common/components/card';
import { NumeralCode } from '../../common/components/numeral-code';
import { ROUTES } from '../../common/config';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { categoryLabel, type CatalogItem } from '../domain/catalog';
import { CatalogImage } from './catalog-image';

export function CatalogDetail({ item }: Readonly<{ item: CatalogItem }>) {
  const { t, format } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link className={buttonStyles({ variant: 'ghost', size: 'sm' })} href={ROUTES.catalog}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('catalog.back')}
        </Link>
      </div>
      <Card className="grid gap-6 md:grid-cols-2">
        <CatalogImage
          alt={t('catalog.imageAlt', { code: item.code })}
          className="aspect-video w-full rounded-lg"
          src={item.imageUrl}
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <NumeralCode code={item.code} size="lg" />
            <Badge tone={item.direction === 'INGRESOS' ? 'success' : 'warning'}>
              {t(`catalog.directions.${item.direction}`)}
            </Badge>
            <Badge>{categoryLabel(item.category, t)}</Badge>
          </div>
          <h1 className="type-title text-foreground">{item.title}</h1>
          <p className="whitespace-pre-line text-muted-foreground">{item.description}</p>
          {item.note && (
            <p className="rounded-lg bg-surface-muted p-3 text-sm text-muted-foreground">
              {item.note}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {t('catalog.lastUpdate', { date: format.date(item.updatedAt) })}
          </p>
        </div>
      </Card>
    </div>
  );
}
