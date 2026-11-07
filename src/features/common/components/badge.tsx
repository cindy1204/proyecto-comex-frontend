import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-foreground',
  primary: 'bg-primary-soft text-primary-soft-foreground',
  success: 'bg-success-soft text-success-soft-foreground',
  warning: 'bg-warning-soft text-warning-soft-foreground',
  danger: 'bg-danger-soft text-danger-soft-foreground',
};

export function Badge({
  tone = 'neutral',
  children,
}: Readonly<{ tone?: BadgeTone; children: ReactNode }>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
