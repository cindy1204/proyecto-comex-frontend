import Link from 'next/link';
import { Card } from '../../common/components/card';
import { getTranslations } from '../../i18n/services/get-translations';
import type { Service } from '../domain/services';

export async function ServiceCard({ service }: Readonly<{ service: Service }>) {
  const { t } = await getTranslations();

  return (
    <Link
      className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      href={`/servicios/${service.slug}`}
    >
      <Card className="flex h-full flex-col gap-3 transition-shadow duration-150 group-hover:shadow-lg">
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-lg bg-primary-soft type-numeral text-primary-soft-foreground"
        >
          {service.code}
        </span>
        <h3 className="type-subtitle text-foreground">
          {t(`services.items.${service.slug}.title`)}
        </h3>
        <p className="text-muted-foreground">{t(`services.items.${service.slug}.description`)}</p>
      </Card>
    </Link>
  );
}
