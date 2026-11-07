import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type AlertTone = 'error' | 'success' | 'info' | 'warning';

const TONES: Record<AlertTone, { container: string; icon: typeof Info; role: 'alert' | 'status' }> =
  {
    error: {
      container: 'border-danger bg-danger-soft text-danger-soft-foreground',
      icon: CircleAlert,
      role: 'alert',
    },
    warning: {
      container: 'border-accent bg-warning-soft text-warning-soft-foreground',
      icon: TriangleAlert,
      role: 'alert',
    },
    success: {
      container: 'border-success bg-success-soft text-success-soft-foreground',
      icon: CircleCheck,
      role: 'status',
    },
    info: {
      container: 'border-primary bg-primary-soft text-primary-soft-foreground',
      icon: Info,
      role: 'status',
    },
  };

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  className?: string;
  children: ReactNode;
}

/** Mensaje accesible: los errores y avisos usan `role="alert"`; los demás, `role="status"`. */
export function Alert({ tone = 'error', title, className, children }: Readonly<AlertProps>) {
  const { container, icon: Icon, role } = TONES[tone];
  return (
    <div
      className={cn('flex gap-3 rounded-lg border-l-4 p-4 text-sm', container, className)}
      role={role}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
