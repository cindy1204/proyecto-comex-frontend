import { useId, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  invalid: boolean;
  required?: boolean;
}

interface FieldProps {
  label: string;
  /** Mensaje de error del campo (por ejemplo `fieldErrors.email`). */
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /** Recibe las props de accesibilidad que debe esparcir el control: `<Input {...control} />`. */
  children: (control: FieldControlProps) => ReactNode;
}

/** Etiqueta + control + ayuda + error, con `aria-describedby` y `aria-invalid` conectados. */
export function Field({ label, error, hint, required, className, children }: Readonly<FieldProps>) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        invalid: Boolean(error),
        required,
      })}
      {hint && (
        <p className="text-sm text-muted-foreground" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-danger" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
