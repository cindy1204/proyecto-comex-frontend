'use client';

import { Badge } from '../../common/components/badge';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { contactProductLabel, type ContactRequest } from '../domain/contact';

export function ContactDetail({ request }: Readonly<{ request: ContactRequest }>) {
  const { t, format } = useTranslation();
  const rows: ReadonlyArray<readonly [string, string]> = [
    [t('contact.detail.name'), request.nombreCompleto],
    [t('contact.fields.email'), request.email],
    [t('contact.fields.company'), request.empresa ?? '—'],
    [t('contact.fields.phone'), request.telefono ?? '—'],
    [
      t('contact.detail.amount'),
      request.montoEstimado === null ? '—' : format.currency(request.montoEstimado),
    ],
    [t('contact.detail.received'), format.dateTime(request.createdAt)],
  ];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Badge tone="primary">{contactProductLabel(request.tipoProducto, t)}</Badge>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="type-label text-muted-foreground">{label}</dt>
            <dd className="break-words text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <h3 className="type-label text-muted-foreground">{t('contact.detail.caseDescription')}</h3>
        <p className="mt-1 whitespace-pre-line text-foreground">{request.descripcionCaso}</p>
      </div>
    </div>
  );
}
