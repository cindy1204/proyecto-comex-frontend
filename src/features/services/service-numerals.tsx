'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { apiRequest } from '@/lib/api';
import type { Service } from './service-data';

interface CatalogItem {
  id: string;
  direction: 'INGRESOS' | 'EGRESOS';
  code: string;
  title: string;
  description: string;
  note: string | null;
}

export function ServiceNumerals({ service }: Readonly<{ service: Service }>) {
  const catalogCategory = service.catalogCategory;
  const [result, setResult] = useState<{
    category: string;
    items: CatalogItem[];
    error: string;
  } | null>(null);

  useEffect(() => {
    if (!catalogCategory) return;

    const controller = new AbortController();
    apiRequest<{ data: CatalogItem[] }>(
      `/api/catalogo?page=1&pageSize=100&category=${encodeURIComponent(catalogCategory)}`,
      { signal: controller.signal },
    )
      .then((response) => setResult({
        category: catalogCategory,
        items: response.data,
        error: '',
      }))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setResult({
            category: catalogCategory,
            items: [],
            error: requestError instanceof Error ? requestError.message : 'No se pudieron cargar los numerales.',
          });
        }
      });

    return () => controller.abort();
  }, [catalogCategory]);

  if (!service.catalogCategory) {
    return <p className="notice">Aún no hay numerales cambiarios cargados para este servicio.</p>;
  }
  if (result?.category !== service.catalogCategory) {
    return <p className="notice">Cargando numerales cambiarios…</p>;
  }
  if (result.error) return <p className="notice notice-error" role="alert">{result.error}</p>;
  const items = result.items;
  if (service.slug === 'servicios') {
    return (
      <>
        <p className="notice">
          Numerales tomados del Anexo 3 del DCIP-83 aportado, actualizado al 1 de septiembre de 2021.
          Confirma la vigencia aplicable con tu intermediario del mercado cambiario.
        </p>
        <NumeralTabs items={items} service={service} />
      </>
    );
  }
  return <NumeralTabs items={items} service={service} />;
}

function NumeralTabs({ items, service }: Readonly<{ items: CatalogItem[]; service: Service }>) {
  const directions: CatalogItem['direction'][] = ['INGRESOS', 'EGRESOS'];
  const [selectedDirection, setSelectedDirection] = useState<CatalogItem['direction'] | null>(null);
  const activeDirection = selectedDirection
    ?? (items.some((item) => item.direction === 'INGRESOS') ? 'INGRESOS' : 'EGRESOS');
  const activeItems = items.filter((item) => item.direction === activeDirection);
  const tabId = (direction: CatalogItem['direction']) => `${service.slug}-numerals-${direction.toLowerCase()}`;

  function selectDirection(direction: CatalogItem['direction'], event?: KeyboardEvent<HTMLButtonElement>) {
    if (event?.key === 'ArrowRight' || event?.key === 'ArrowLeft') {
      event.preventDefault();
      const currentIndex = directions.indexOf(direction);
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const nextDirection = directions[(currentIndex + offset + directions.length) % directions.length];
      setSelectedDirection(nextDirection);
      document.getElementById(tabId(nextDirection))?.focus();
      return;
    }
    if (event && event.key !== 'Enter' && event.key !== ' ') return;
    setSelectedDirection(direction);
  }

  return (
    <>
      <div aria-label="Tipo de numeral cambiario" className="numeral-tabs" role="tablist">
        {directions.map((direction) => {
          const isActive = activeDirection === direction;
          const count = items.filter((item) => item.direction === direction).length;
          return (
            <button
              aria-controls={`${tabId(direction)}-panel`}
              aria-selected={isActive}
              className={`numeral-tab${isActive ? ' numeral-tab-active' : ''}`}
              id={tabId(direction)}
              key={direction}
              onClick={() => setSelectedDirection(direction)}
              onKeyDown={(event) => selectDirection(direction, event)}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {direction === 'INGRESOS' ? 'Ingresos' : 'Egresos'} <span>{count}</span>
            </button>
          );
        })}
      </div>
      <div
        aria-labelledby={tabId(activeDirection)}
        className="numeral-tab-panel"
        id={`${tabId(activeDirection)}-panel`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeItems.length === 0 ? (
          <p className="notice">No hay numerales de {activeDirection === 'INGRESOS' ? 'ingreso' : 'egreso'} cargados para este servicio.</p>
        ) : (
          <div className="catalog-grid">
            {activeItems.map((item) => (
              <article className="catalog-card" key={item.id}>
                <div className="catalog-card-top">
                  <span className="catalog-code">{item.code}</span>
                  <span className="catalog-direction">{item.direction === 'INGRESOS' ? 'Ingreso' : 'Egreso'}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                {item.note && <p className="catalog-note">{item.note}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
