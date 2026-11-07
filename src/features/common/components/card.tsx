import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export function Card({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-surface p-6 shadow-card', className)}
      {...props}
    />
  );
}
