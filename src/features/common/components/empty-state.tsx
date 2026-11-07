import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Acción sugerida, normalmente un `Button` o un enlace con `buttonStyles`. */
  children?: ReactNode;
}

export function EmptyState({ title, description, icon, children }: Readonly<EmptyStateProps>) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <span aria-hidden="true" className="text-muted-foreground">
        {icon ?? <Inbox className="size-10" />}
      </span>
      <h2 className="type-subtitle text-foreground">{title}</h2>
      {description && <p className="max-w-md text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
