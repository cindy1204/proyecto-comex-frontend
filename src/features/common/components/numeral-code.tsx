import { cn } from '../utils/cn';

interface NumeralCodeProps {
  code: string;
  size?: 'sm' | 'lg';
  className?: string;
}

/**
 * Sello del numeral cambiario: el código en monoespaciada con cifras tabulares y una marca
 * amarilla (acento) a la izquierda. Es la firma visual de ColComex; se usa solo donde aparece un
 * numeral, para que el acento siga siendo escaso.
 */
export function NumeralCode({ code, size = 'sm', className }: Readonly<NumeralCodeProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-border bg-surface-muted px-2 py-0.5 type-numeral text-foreground',
        'before:h-4 before:w-1 before:shrink-0 before:rounded-full before:bg-accent before:content-[""]',
        size === 'lg' ? 'text-lg' : 'text-sm',
        className,
      )}
    >
      {code}
    </span>
  );
}
