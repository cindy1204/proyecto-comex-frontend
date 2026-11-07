import { cn } from '../utils/cn';

/** Estilo compartido por Input, Textarea y Select. */
export function controlStyles(invalid: boolean | undefined, className?: string): string {
  return cn(
    'w-full rounded-lg border bg-surface px-3 py-2 text-base text-foreground transition-colors duration-150',
    'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60',
    'min-h-11',
    invalid ? 'border-danger' : 'border-input-border hover:border-muted-foreground',
    className,
  );
}
