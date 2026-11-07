import type { SelectHTMLAttributes } from 'react';
import { controlStyles } from './form-controls';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, children, ...props }: Readonly<SelectProps>) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={controlStyles(invalid, className)}
      {...props}
    >
      {children}
    </select>
  );
}
