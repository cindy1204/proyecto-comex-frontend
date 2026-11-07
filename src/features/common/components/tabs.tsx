'use client';

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface TabItem<TId extends string> {
  id: TId;
  label: string;
  /** Dato breve junto a la etiqueta (p. ej. un total). */
  badge?: ReactNode;
}

interface TabsProps<TId extends string> {
  /** Identifica el grupo de pestañas (prefijo de los `id` ARIA). */
  name: string;
  label: string;
  tabs: ReadonlyArray<TabItem<TId>>;
  active: TId;
  onChange: (id: TId) => void;
  /** Contenido del panel activo. */
  children: ReactNode;
}

/** Pestañas accesibles (WAI-ARIA): flechas, Inicio y Fin mueven el foco y la selección. */
export function Tabs<TId extends string>({
  name,
  label,
  tabs,
  active,
  onChange,
  children,
}: Readonly<TabsProps<TId>>) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const list = useRef<HTMLDivElement>(null);
  const activeIndex = tabs.findIndex((tab) => tab.id === active);

  // En pantallas angostas la lista desplaza horizontalmente: la pestaña activa (inicial, por
  // teclado o por clic) debe quedar visible. Solo se mueve el eje X de la lista, nunca la página.
  useEffect(() => {
    const container = list.current;
    const button = buttons.current[activeIndex];
    if (!container || !button) return;
    const box = container.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    if (rect.left < box.left) container.scrollLeft -= box.left - rect.left;
    else if (rect.right > box.right) container.scrollLeft += rect.right - box.right;
  }, [activeIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    onChange(tabs[target].id);
    buttons.current[target]?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        aria-label={label}
        className="flex gap-1 overflow-x-auto border-b border-border"
        ref={list}
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === active;
          return (
            <button
              aria-controls={`${name}-panel-${tab.id}`}
              aria-selected={isActive}
              className={cn(
                'flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:px-4',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              id={`${name}-tab-${tab.id}`}
              key={tab.id}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-foreground">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        aria-labelledby={`${name}-tab-${active}`}
        id={`${name}-panel-${active}`}
        role="tabpanel"
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
