import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  /** Acciones alineadas a la derecha (botones). */
  actions?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, actions }: Readonly<PageHeaderProps>) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 type-eyebrow text-primary">{eyebrow}</p>}
        <h1 className="type-title text-foreground">{title}</h1>
        {description && <p className="mt-2 text-lg text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
