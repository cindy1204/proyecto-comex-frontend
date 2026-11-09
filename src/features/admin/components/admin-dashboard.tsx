'use client';

import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { CatalogAdminPanel } from '../../catalog/components/catalog-admin-panel';
import { Alert } from '../../common/components/alert';
import { Card } from '../../common/components/card';
import { Container } from '../../common/components/container';
import { PageHeader } from '../../common/components/page-header';
import { Tabs } from '../../common/components/tabs';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { ContactRequestsList } from '../../contact/components/contact-requests-list';
import { InteractionsList } from '../../interactions/components/interactions-list';
import { ADMIN_TABS, type AdminTab, type AdminTotals } from '../domain/admin';
import { useAdminTotals } from '../hooks/use-admin-totals';
import { CreateAdminForm } from './create-admin-form';

const TOTAL_BY_TAB: Partial<Record<AdminTab, keyof AdminTotals>> = {
  catalogo: 'catalog',
  interacciones: 'interactions',
  solicitudes: 'requests',
};

export function AdminDashboard({ initialTab = 'catalogo' }: Readonly<{ initialTab?: AdminTab }>) {
  const [active, setActive] = useState<AdminTab>(initialTab);
  const totals = useAdminTotals();
  const { t } = useTranslation();

  function select(tab: AdminTab) {
    setActive(tab);
    totals.reload();
  }

  const tabs = ADMIN_TABS.map((tab) => {
    const key = TOTAL_BY_TAB[tab.id];
    return {
      id: tab.id,
      label: t(tab.labelKey),
      badge: key && totals.data ? totals.data[key] : undefined,
    };
  });

  return (
    <Container className="flex flex-col gap-8 py-10">
      <PageHeader
        description={t('admin.description')}
        eyebrow={t('admin.eyebrow')}
        title={t('admin.title')}
      />
      {totals.error && (
        <Alert tone="warning">{t('admin.totalsError', { error: totals.error })}</Alert>
      )}
      <Tabs active={active} label={t('admin.tabsLabel')} name="admin" onChange={select} tabs={tabs}>
        {active === 'catalogo' && <CatalogAdminPanel />}
        {active === 'interacciones' && <InteractionsList scope="all" />}
        {active === 'solicitudes' && <ContactRequestsList scope="all" />}
        {active === 'administradores' && (
          <section aria-labelledby="admin-create" className="flex max-w-2xl flex-col gap-4">
            <h2 className="flex items-center gap-2 type-heading text-foreground" id="admin-create">
              <UserPlus aria-hidden="true" className="size-6" />
              {t('admin.create.title')}
            </h2>
            <Card>
              <CreateAdminForm />
            </Card>
          </section>
        )}
      </Tabs>
    </Container>
  );
}
